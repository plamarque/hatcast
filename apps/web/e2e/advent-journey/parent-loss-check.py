#!/usr/bin/env python3
"""Observe restoration after terminating the guardian's immediate parent."""
import json
import os
import pathlib
import select
import socket
import subprocess
import sys
import tempfile

ROOT=pathlib.Path(__file__).parent

def read_message(fd):
    data=bytearray()
    while True:
        ready,_,_=select.select([fd],[],[],60)
        if not ready: raise RuntimeError('Guardian timed out')
        byte=os.read(fd,1)
        if not byte: raise RuntimeError('Guardian closed output')
        if byte==b'\n': return json.loads(data)
        data.extend(byte)
        if len(data)>4096: raise RuntimeError('Invalid output')

def helper(control_fd, output_fd, mode, state):
    control=socket.socket(fileno=control_fd)
    cmd=([sys.executable,str(ROOT/'clock-guardian.py'),'--simulate','--state-file',state,'--short-pipe-check'] if mode=='sim' else ([sys.executable,str(ROOT/'clock-guardian.py'),'--short-pipe-check'] if mode=='direct' else ['/usr/bin/sudo','-n','/usr/bin/python3',str(ROOT/'clock-guardian.py'),'--short-pipe-check']))
    guardian=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=output_fd,stderr=subprocess.DEVNULL,close_fds=True)
    os.close(output_fd)
    try:
        if control.recv(1)!=b'G': raise RuntimeError('Observer disconnected')
        guardian.stdin.write(b'{"op":"short"}\n'); guardian.stdin.flush()
        # EOF if the observer dies; exiting closes the guardian control pipe.
        control.recv(1)
    finally:
        guardian.stdin.close()
        control.close()

def observe(mode):
    simulated=mode=='sim'
    if mode=='direct' and os.geteuid()!=0: raise RuntimeError('Privilege required')
    with tempfile.TemporaryDirectory(prefix='advent-parent-check-') as directory:
        os.chmod(directory,0o700)
        state=str(pathlib.Path(directory)/'state')
        reader,writer=os.pipe()
        observer,child=socket.socketpair()
        proc=subprocess.Popen([sys.executable,__file__,'--helper',str(child.fileno()),str(writer),mode,state],pass_fds=(child.fileno(),writer),close_fds=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        child.close(); os.close(writer)
        try:
            if read_message(reader).get('status')!='ready': raise RuntimeError('Guardian not ready')
            observer.sendall(b'G')
            first=read_message(reader)
            if first.get('status')!='day' or first.get('day')!=1: raise RuntimeError('Short change not confirmed')
            # Only the guardian's unprivileged immediate parent is killed.
            proc.kill(); proc.wait(timeout=5)
            restored=read_message(reader)
            if restored.get('status')!='restored' or restored.get('changed') is not True: raise RuntimeError('Restoration not confirmed')
            if simulated:
                events=[json.loads(line) for line in pathlib.Path(state).read_text().splitlines()]
                if events[-1]['event']!='network' or events[-1]['network'] is not True or abs(events[-2]['offset'])>=5: raise RuntimeError('Simulation restoration mismatch')
            print(json.dumps({'status':'parent-loss-check-passed','restored':True}))
        finally:
            observer.close(); os.close(reader)
            if proc.poll() is None: proc.terminate(); proc.wait(timeout=5)

if __name__=='__main__':
    try:
        if len(sys.argv)==6 and sys.argv[1]=='--helper': helper(int(sys.argv[2]),int(sys.argv[3]),sys.argv[4],sys.argv[5])
        elif sys.argv[1:]==['--simulate']: observe('sim')
        elif sys.argv[1:]==['--real']: observe('real')
        elif sys.argv[1:]==['--direct']: observe('direct')
        else: raise RuntimeError('Invalid mode')
    except Exception:
        print('Parent-loss check failed; restoration may need explicit recovery.',file=sys.stderr)
        sys.exit(1)
