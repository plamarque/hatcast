#!/usr/bin/env python3
"""Relay a simulated or privileged guardian through a dedicated socket."""
import json
import os
import pathlib
import select
import socket
import subprocess
import sys
import tempfile

ROOT=pathlib.Path(__file__).parent
# Real mode enabled after controlled privileged guardian validation.
REAL_BRIDGE_ENABLED=True

def expect_reply(proc, status, day=None):
    ready,_,_=select.select([proc.stdout],[],[],60)
    if not ready: raise RuntimeError('Guardian response timed out')
    line=proc.stdout.readline()
    if not line: raise RuntimeError('Guardian stopped unexpectedly')
    msg=json.loads(line)
    if msg.get('status') != status or (day is not None and msg.get('day') != day): raise RuntimeError('Guardian refused request')

def exercise(real=False):
    if real and not REAL_BRIDGE_ENABLED: raise RuntimeError('Privileged bridge disabled')
    with tempfile.TemporaryDirectory(prefix='advent-guardian-sim-') as directory:
        os.chmod(directory,0o700)
        state=str(pathlib.Path(directory)/'state.jsonl')
        guardian_command=(['/usr/bin/sudo','-n','/usr/bin/python3',str(ROOT/'clock-guardian.py')] if real else [sys.executable,str(ROOT/'clock-guardian.py'),'--simulate','--state-file',state])
        # One sudo child owns all privileged clock changes and restoration.
        guardian=subprocess.Popen(guardian_command, stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,close_fds=True)
        parent,child=socket.socketpair()
        parent.settimeout(300)
        runner=None
        try:
            expect_reply(guardian,'ready')
            # The browser process receives only the socket, never the guardian's stdin.
            env={**os.environ,'ADVENT_GUARDIAN_FD':str(child.fileno())}
            runner_script='journey.cjs' if real else 'clock-proxy.cjs'
            runner=subprocess.Popen(['node',str(ROOT/runner_script)],env=env,pass_fds=(child.fileno(),),close_fds=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            child.close()
            with parent.makefile('rb') as incoming:
                for expected in range(1,27):
                    line=incoming.readline(4097)
                    if not line or len(line)>4096: raise RuntimeError('Runner disconnected')
                    msg=json.loads(line)
                    if msg!={'op':'day','day':expected}: raise RuntimeError('Invalid runner progression')
                    guardian.stdin.write(json.dumps(msg)+'\n'); guardian.stdin.flush()
                    expect_reply(guardian,'day',expected)
                    parent.sendall((json.dumps({'status':'day','day':expected})+'\n').encode())
            if runner.wait(timeout=300)!=0: raise RuntimeError('Runner failed')
            guardian.stdin.write('{"op":"finish"}\n'); guardian.stdin.flush()
            expect_reply(guardian,'restored')
            if guardian.wait(timeout=5)!=0: raise RuntimeError('Guardian failed')
            if not real:
                rows=[json.loads(line) for line in pathlib.Path(state).read_text().splitlines()]
                if rows[-1]['event']!='network' or rows[-1]['network'] is not True or abs(rows[-2]['offset'])>=5: raise RuntimeError('Restoration not verified')
        finally:
            parent.close(); child.close()
            if guardian.stdin and not guardian.stdin.closed: guardian.stdin.close()
            if runner and runner.poll() is None: runner.terminate(); runner.wait(timeout=5)
            try: guardian.wait(timeout=90)
            except subprocess.TimeoutExpired:
                print('Guardian restoration not confirmed; use --recover-clock after checking the guardian.',file=sys.stderr)
                raise RuntimeError('Guardian did not finish restoring')
            for stream in (guardian.stdout,guardian.stderr):
                if stream: stream.close()
    if not real: print('Simulated launcher, socket relay and guardian: 26 days and restoration verified; system clock untouched.')

if __name__=='__main__':
    try:
        if sys.argv[1:] not in ([],['--real-journey']): raise RuntimeError('Invalid mode')
        exercise(real=sys.argv[1:]==['--real-journey'])
    except Exception:
        print('Guardian or journey failed; restoration and private evidence require review.',file=sys.stderr); sys.exit(1)
