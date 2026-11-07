#!/usr/bin/env python3
"""Validate parent-loss and guardian-crash recovery; real execution requires root."""
import json
import os
import pathlib
import select
import signal
import subprocess
import sys
import tempfile
import time

ROOT=pathlib.Path(__file__).parent
GUARD=str(ROOT/'clock-guardian.py')

def read_reply(proc):
    ready,_,_=select.select([proc.stdout],[],[],60)
    if not ready: raise RuntimeError('Guardian response timed out')
    line=proc.stdout.readline()
    if not line: raise RuntimeError('Guardian stopped')
    return json.loads(line)

def recover(command):
    result=subprocess.run(command,capture_output=True,text=True,timeout=60)
    if result.returncode!=0: raise RuntimeError('Recovery failed')
    if json.loads(result.stdout).get('status')!='recovered': raise RuntimeError('Recovery unconfirmed')

def validate(simulated, fail_after_kill=False):
    if not simulated and (os.geteuid()!=0 or sys.platform!='darwin'): raise RuntimeError('Privileged macOS process required')
    interrupted=False
    def stop(_sig,_frame):
        nonlocal interrupted
        interrupted=True
        raise RuntimeError('Interrupted')
    for sig in (signal.SIGINT,signal.SIGTERM,signal.SIGHUP): signal.signal(sig,stop)
    with tempfile.TemporaryDirectory(prefix='advent-recovery-check-') as directory:
        os.chmod(directory,0o700)
        state=str(pathlib.Path(directory)/'state')
        journal=pathlib.Path(directory,'clock-recovery.json') if simulated else pathlib.Path('/var/db/hatcast-advent-clock/clock-recovery.json')
        if os.path.lexists(journal): raise RuntimeError('Existing recovery record requires separate resolution')
        base=[sys.executable,GUARD]+(['--simulate','--state-file',state] if simulated else [])
        operation_started=False
        guardian=None
        try:
            operation_started=True
            parent=subprocess.run([sys.executable,str(ROOT/'parent-loss-check.py'),'--simulate' if simulated else '--direct'],capture_output=True,text=True,timeout=150)
            if parent.returncode!=0 or json.loads(parent.stdout).get('status')!='parent-loss-check-passed': raise RuntimeError('Parent loss check failed')
            if interrupted: raise RuntimeError('Interrupted')
            guardian=subprocess.Popen(base+['--short-pipe-check'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True,close_fds=True)
            if read_reply(guardian).get('status')!='ready': raise RuntimeError('Guardian not ready')
            guardian.stdin.write('{"op":"short"}\n'); guardian.stdin.flush()
            if read_reply(guardian).get('status')!='day': raise RuntimeError('Clock change unconfirmed')
            # Only the guardian process launched above is killed. The journal must survive.
            guardian.kill(); guardian.wait(timeout=10)
            if not os.path.lexists(journal): raise RuntimeError('Recovery record absent')
            if fail_after_kill: raise RuntimeError('Injected simulated failure')
            recover(base+['--recover'])
            if os.path.lexists(journal): raise RuntimeError('Recovery record not cleared')
            if simulated:
                lines=[json.loads(line) for line in pathlib.Path(state).read_text().splitlines()]
                if lines[-1]['event']!='network' or lines[-1]['network'] is not True or abs(lines[-2]['offset'])>=5: raise RuntimeError('Simulated recovery mismatch')
            print(json.dumps({'status':'guardian-validation-passed','parentLossRestored':True,'crashRecovered':True}))
        finally:
            if guardian:
                if guardian.stdin and not guardian.stdin.closed: guardian.stdin.close()
                if guardian.poll() is None:
                    try: guardian.wait(timeout=30)
                    except subprocess.TimeoutExpired: pass # Do not kill a possibly restoring guardian.
                if guardian.stdout: guardian.stdout.close()
            # A failure in either test gets a separately verified recovery attempt.
            if operation_started and os.path.lexists(journal):
                deadline=time.monotonic()+60
                while os.path.lexists(journal):
                    try:
                        recover(base+['--recover'])
                        break
                    except Exception:
                        if time.monotonic()>=deadline: raise
                        # A surviving guardian may still hold the lock while restoring.
                        time.sleep(0.5)


if __name__=='__main__':
    try:
        if sys.argv[1:]==['--simulate']: validate(True)
        elif sys.argv[1:]==['--real']: validate(False)
        else: raise RuntimeError('Invalid mode')
    except Exception:
        print('Guardian validation failed. If restoration is uncertain, use the explicit recovery action.',file=sys.stderr)
        sys.exit(1)
