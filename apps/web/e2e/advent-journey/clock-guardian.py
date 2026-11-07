#!/usr/bin/env python3
"""Privileged clock guardian with durable recovery journal."""
import argparse
import ctypes
import math
import stat
import datetime as dt
import fcntl
import json
import os
import re
import select
import signal
import subprocess
import sys
import time

REAL_CLOCK_ENABLED = True
PARIS_NOON_UTC = dt.datetime(2026, 12, 1, 11, tzinfo=dt.timezone.utc).timestamp()

class RealClock:
    def run(self, *args):
        # Fixed executable paths and argument values only. No shell or environment secrets.
        return subprocess.run(args, check=True, text=True, capture_output=True, timeout=15).stdout
    def network(self):
        value = self.run('/usr/sbin/systemsetup', '-getusingnetworktime')
        match = re.search(r'Network Time:\s*(On|Off)\s*$', value, re.I)
        if not match:
            raise RuntimeError('Unable to determine automatic-time setting')
        return match.group(1).lower() == 'on'
    def set_network(self, enabled):
        self.run('/usr/sbin/systemsetup', '-setusingnetworktime', 'on' if enabled else 'off')
    def wall(self):
        return time.time()
    def mono(self):
        class Timebase(ctypes.Structure):
            _fields_=[('numer',ctypes.c_uint32),('denom',ctypes.c_uint32)]
        lib=ctypes.CDLL('/usr/lib/libSystem.B.dylib')
        lib.mach_continuous_time.restype=ctypes.c_uint64
        info=Timebase()
        if lib.mach_timebase_info(ctypes.byref(info)) != 0 or info.denom == 0: raise RuntimeError('Continuous clock unavailable')
        return lib.mach_continuous_time()*info.numer/info.denom/1e9
    def boot(self):
        value=self.run('/usr/sbin/sysctl','-n','kern.bootsessionuuid').strip()
        if not re.fullmatch(r'[A-Fa-f0-9-]{36}',value): raise RuntimeError('Boot identity unavailable')
        return value
    def set_wall(self, timestamp):
        value = dt.datetime.fromtimestamp(timestamp, dt.timezone.utc).strftime('%m%d%H%M%Y.%S')
        self.run('/bin/date', '-u', value)

class SimulatedClock:
    def __init__(self, state_file, initial_network):
        self.state_file = state_file
        self.auto = initial_network
        self.offset = 0
        self.publish('initial')
    def publish(self, event):
        # Test-only file; contains no catalogue data, credentials or real clock settings.
        with open(self.state_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps({'event':event,'network':self.auto,'offset':round(self.offset,2)})+'\n')
    def network(self): return self.auto
    def set_network(self, enabled): self.auto=enabled; self.publish('network')
    def wall(self): return time.time()+self.offset
    def mono(self): return time.monotonic()
    def boot(self): return 'simulated-boot'
    def set_wall(self, timestamp): self.offset=timestamp-time.time(); self.publish('wall')

class RecoveryJournal:
    NAME='clock-recovery.json'
    def __init__(self, directory):
        self.fd=os.open(directory,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW)
        info=os.fstat(self.fd)
        if not stat.S_ISDIR(info.st_mode) or info.st_uid!=os.geteuid() or info.st_mode & 0o077:
            os.close(self.fd); raise RuntimeError('Unsafe journal directory')
        try: fcntl.flock(self.fd,fcntl.LOCK_EX|fcntl.LOCK_NB)
        except OSError: os.close(self.fd); raise RuntimeError('Another guardian or recovery is active')
    def exists(self):
        try: os.stat(self.NAME,dir_fd=self.fd,follow_symlinks=False); return True
        except FileNotFoundError: return False
    def write(self, record):
        payload=json.dumps(record,sort_keys=True).encode()
        f=os.open(self.NAME,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600,dir_fd=self.fd)
        try:
            with os.fdopen(f,'wb') as stream:
                stream.write(payload); stream.flush(); os.fsync(stream.fileno())
            os.fsync(self.fd)
        except Exception:
            raise RuntimeError('Recovery journal could not be persisted')
    def read(self):
        f=os.open(self.NAME,os.O_RDONLY|os.O_NOFOLLOW,dir_fd=self.fd)
        with os.fdopen(f,'rb') as stream:
            info=os.fstat(stream.fileno())
            if not stat.S_ISREG(info.st_mode) or info.st_uid!=os.geteuid() or info.st_nlink!=1 or info.st_mode & 0o077 or info.st_size>4096:
                raise RuntimeError('Unsafe recovery record')
            record=json.load(stream)
        if set(record)!={'version','boot','wall','mono','network'} or record['version']!=1 or type(record['network']) is not bool or not isinstance(record['boot'],str): raise RuntimeError('Invalid recovery record')
        for key in ('wall','mono'):
            if type(record[key]) not in (int,float) or not math.isfinite(record[key]) or record[key]<0: raise RuntimeError('Invalid recovery record')
        return record
    def remove(self):
        os.unlink(self.NAME,dir_fd=self.fd); os.fsync(self.fd)
    def close(self): os.close(self.fd)

def restore(backend, record):
    if record['boot']!=backend.boot() or backend.mono()<record['mono']:
        raise RuntimeError('Boot changed; independent time recovery required')
    error=None
    try:
        target=record['wall']+(backend.mono()-record['mono'])
        backend.set_wall(target)
        if abs(backend.wall()-target)>5: raise RuntimeError('Wall clock restoration failed')
    except Exception as exc: error=exc
    try:
        backend.set_network(record['network'])
        if backend.network()!=record['network']: raise RuntimeError('Automatic-time restoration failed')
    except Exception as exc: error=error or exc
    if error: raise RuntimeError('Clock restoration failed') from error

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--simulate', action='store_true')
    parser.add_argument('--state-file')
    parser.add_argument('--journal-dir')
    parser.add_argument('--recover', action='store_true')
    parser.add_argument('--short-check', action='store_true')
    parser.add_argument('--short-pipe-check', action='store_true')
    parser.add_argument('--initial-network', choices=['on','off'], default='on')
    parser.add_argument('--max-seconds', type=int, default=1800)
    args=parser.parse_args()
    if sum((args.recover,args.short_check,args.short_pipe_check))>1: raise RuntimeError('Choose one action')
    if not 1 <= args.max_seconds <= 1800:
        raise RuntimeError('Invalid watchdog timeout')
    if args.simulate:
        if not args.state_file: raise RuntimeError('Simulation requires a state file')
        backend=SimulatedClock(args.state_file,args.initial_network=='on')
    else:
        if not REAL_CLOCK_ENABLED and not (args.short_check or args.short_pipe_check or args.recover):
            raise RuntimeError('Real journey clock guardian is disabled pending validation')
        if os.geteuid()!=0 or sys.platform!='darwin': raise RuntimeError('Privileged macOS process required')
        backend=RealClock()
    if args.simulate:
        journal_dir=args.journal_dir or os.path.dirname(os.path.abspath(args.state_file))
    else:
        if args.journal_dir: raise RuntimeError('Custom journal path is forbidden')
        journal_dir='/var/db/hatcast-advent-clock'
        try: os.mkdir(journal_dir,0o700)
        except FileExistsError: pass
    journal=RecoveryJournal(journal_dir)
    if args.recover:
        record=journal.read()
        restore(backend,record)
        journal.remove(); journal.close()
        print(json.dumps({'status':'recovered'}),flush=True)
        return
    if journal.exists(): raise RuntimeError('Unresolved recovery record')
    initial_network=backend.network()
    baseline_wall=backend.wall()
    baseline_mono=backend.mono()
    deadline=baseline_mono+args.max_seconds
    modified=False
    last_day=0
    interrupted=False
    def stop(_sig,_frame):
        nonlocal interrupted
        interrupted=True
    for sig in (signal.SIGINT,signal.SIGTERM,signal.SIGHUP): signal.signal(sig,stop)
    def reply(status, **fields):
        print(json.dumps({'status':status,**fields}),flush=True)
    if args.short_check:
        record={'version':1,'boot':backend.boot(),'wall':baseline_wall,'mono':baseline_mono,'network':initial_network}
        journal.write(record)
        modified=True
        try:
            backend.set_network(False)
            if backend.network(): raise RuntimeError('Automatic time did not turn off')
            if interrupted: raise RuntimeError('Interrupted')
            target=baseline_wall+(backend.mono()-baseline_mono)+30
            backend.set_wall(target)
            if abs(backend.wall()-target)>5: raise RuntimeError('Clock change could not be verified')
            if interrupted: raise RuntimeError('Interrupted')
        finally:
            restore(backend,record)
            journal.remove(); journal.close()
        reply('short-check-passed',restored=True)
        return
    reply('ready')
    try:
        # stdin is a dedicated parent-owned pipe. EOF, parent death, signal and timeout restore.
        while not interrupted and backend.mono() < deadline:
            ready,_,_=select.select([sys.stdin],[],[],min(0.5,max(0,deadline-backend.mono())))
            if not ready: continue
            line=sys.stdin.readline()
            if not line: break
            message=json.loads(line)
            if message == {'op':'finish'}: break
            if args.short_pipe_check:
                if message != {'op':'short'} or last_day != 0: raise RuntimeError('Invalid short clock check')
                requested_day=1
            else:
                if set(message) != {'op','day'} or message['op']!='day' or type(message['day']) is not int or message['day'] != last_day+1 or not 1 <= message['day'] <= 26: raise RuntimeError('Invalid clock progression')
                requested_day=message['day']
            if not modified:
                # Mark first: even a partially failing setting must trigger restoration.
                record={'version':1,'boot':backend.boot(),'wall':baseline_wall,'mono':baseline_mono,'network':initial_network}
                journal.write(record)
                modified=True
                backend.set_network(False)
                if backend.network(): raise RuntimeError('Automatic time did not turn off')
            target=(baseline_wall+(backend.mono()-baseline_mono)+30) if args.short_pipe_check else PARIS_NOON_UTC+(requested_day-1)*86400
            backend.set_wall(target)
            if abs(backend.wall()-target)>5: raise RuntimeError('Clock change could not be verified')
            last_day=requested_day
            reply('day', day=last_day)
    finally:
        if modified:
            try:
                restore(backend,record)
                journal.remove()
            except Exception:
                reply('restore-failed')
                raise
        journal.close()
        reply('restored', changed=modified)

if __name__=='__main__':
    try: main()
    except Exception:
        print('Clock guardian failed; inspect local clock and automatic-time setting.',file=sys.stderr)
        sys.exit(1)
