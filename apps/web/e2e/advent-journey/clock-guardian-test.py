import json
import os
import pathlib
import subprocess
import sys
import tempfile
import time
import unittest

GUARD=str(pathlib.Path(__file__).with_name('clock-guardian.py'))

def start(path, network='on', seconds=10):
    proc=subprocess.Popen([sys.executable,GUARD,'--simulate','--state-file',str(path),'--initial-network',network,'--max-seconds',str(seconds)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    assert json.loads(proc.stdout.readline())['status']=='ready'
    return proc

def close(proc):
    for stream in (proc.stdin,proc.stdout,proc.stderr):
        if stream and not stream.closed: stream.close()

def send(proc, message):
    proc.stdin.write(json.dumps(message)+'\n'); proc.stdin.flush()
    return json.loads(proc.stdout.readline())

def events(path): return [json.loads(line) for line in path.read_text().splitlines()]
def wait_restored(path, network):
    deadline=time.monotonic()+5
    while time.monotonic()<deadline:
        es=events(path)
        if len(es)>=4 and es[-1]['event']=='network' and es[-1]['network']==network and abs(es[-2]['offset'])<5: return
        time.sleep(.05)
    raise AssertionError('Simulated restoration missing')

class GuardianTest(unittest.TestCase):
    def setUp(self): self.tmp=tempfile.TemporaryDirectory(); self.path=pathlib.Path(self.tmp.name)/'state'
    def tearDown(self): self.tmp.cleanup()
    def test_normal_restore_on_and_off(self):
        for i,net in enumerate(('on','off')):
            pth=self.path.with_name(str(i)); p=start(pth,net)
            self.assertEqual(send(p,{'op':'day','day':1})['day'],1)
            self.assertEqual(send(p,{'op':'day','day':2})['day'],2)
            self.assertEqual(send(p,{'op':'finish'})['status'],'restored')
            self.assertEqual(p.wait(timeout=5),0); wait_restored(pth,net=='on'); close(p)
    def test_invalid_sequence_restores(self):
        p=start(self.path); send(p,{'op':'day','day':1})
        self.assertEqual(send(p,{'op':'day','day':3})['status'],'restored')
        self.assertNotEqual(p.wait(timeout=5),0); wait_restored(self.path,True); close(p)
    def test_eof_and_signal_restore(self):
        p=start(self.path); send(p,{'op':'day','day':1}); p.stdin.close()
        self.assertEqual(json.loads(p.stdout.readline())['status'],'restored')
        self.assertEqual(p.wait(timeout=5),0); wait_restored(self.path,True); close(p)
        pth=self.path.with_name('signal'); p=start(pth,'off'); send(p,{'op':'day','day':1}); p.terminate()
        self.assertEqual(json.loads(p.stdout.readline())['status'],'restored')
        self.assertEqual(p.wait(timeout=5),0); wait_restored(pth,False); close(p)
    def test_timeout_restores(self):
        p=start(self.path,seconds=1); send(p,{'op':'day','day':1})
        self.assertEqual(json.loads(p.stdout.readline())['status'],'restored')
        self.assertEqual(p.wait(timeout=5),0); wait_restored(self.path,True); close(p)
    def test_parent_death_closes_pipe_and_restores(self):
        helper='''import json,os,subprocess,sys\np=subprocess.Popen([sys.executable,sys.argv[1],"--simulate","--state-file",sys.argv[2]],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL,text=True)\np.stdout.readline()\np.stdin.write(json.dumps({"op":"day","day":1})+"\\n");p.stdin.flush();p.stdout.readline()\nos._exit(0)\n'''
        subprocess.run([sys.executable,'-c',helper,GUARD,str(self.path)],check=True,timeout=5)
        wait_restored(self.path,True)
    def test_killed_guardian_leaves_record_and_recovers(self):
        for i, net in enumerate(('on','off')):
            directory=pathlib.Path(self.tmp.name)/('killed-'+net); directory.mkdir(mode=0o700)
            state=directory/'state'; journal=directory/'clock-recovery.json'
            p=start(state,net); send(p,{'op':'day','day':1})
            self.assertTrue(journal.is_file())
            p.kill(); p.wait(timeout=5); close(p)
            self.assertTrue(journal.exists())
            refused=subprocess.run([sys.executable,GUARD,'--simulate','--state-file',str(state)],capture_output=True,text=True,timeout=5)
            self.assertNotEqual(refused.returncode,0)
            recovered=subprocess.run([sys.executable,GUARD,'--simulate','--state-file',str(state),'--recover'],capture_output=True,text=True,timeout=5)
            self.assertEqual(recovered.returncode,0); self.assertFalse(journal.exists())
            wait_restored(state,net=='on')
    def test_reboot_and_unsafe_record_refuse_recovery(self):
        p=start(self.path); send(p,{'op':'day','day':1}); p.kill(); p.wait(timeout=5); close(p)
        journal=self.path.parent/'clock-recovery.json'
        data=json.loads(journal.read_text()); data['boot']='different-boot'; journal.write_text(json.dumps(data))
        result=subprocess.run([sys.executable,GUARD,'--simulate','--state-file',str(self.path),'--recover'],capture_output=True,text=True,timeout=5)
        self.assertNotEqual(result.returncode,0); self.assertTrue(journal.exists())
        data['boot']='simulated-boot'; journal.write_text(json.dumps(data)); journal.chmod(0o644)
        result=subprocess.run([sys.executable,GUARD,'--simulate','--state-file',str(self.path),'--recover'],capture_output=True,text=True,timeout=5)
        self.assertNotEqual(result.returncode,0); self.assertTrue(journal.exists())
    def test_short_check_restores_both_network_settings(self):
        for net in ('on','off'):
            directory=pathlib.Path(self.tmp.name)/('short-'+net); directory.mkdir(mode=0o700)
            state=directory/'state'; journal=directory/'clock-recovery.json'
            result=subprocess.run([sys.executable,GUARD,'--simulate','--state-file',str(state),'--initial-network',net,'--short-check'],capture_output=True,text=True,timeout=5)
            self.assertEqual(result.returncode,0)
            self.assertEqual(json.loads(result.stdout)['status'],'short-check-passed')
            self.assertFalse(journal.exists())
            rows=events(state)
            self.assertTrue(any(row['event']=='wall' and 29 <= row['offset'] <= 31 for row in rows))
            wait_restored(state,net=='on')
    def test_concurrent_short_check_refuses_without_changes(self):
        p=start(self.path)
        result=subprocess.run([sys.executable,GUARD,'--simulate','--state-file',str(self.path),'--short-check'],capture_output=True,text=True,timeout=5)
        self.assertNotEqual(result.returncode,0)
        self.assertFalse((self.path.parent/'clock-recovery.json').exists())
        self.assertEqual(send(p,{'op':'finish'})['status'],'restored')
        p.wait(timeout=5); close(p)
    def test_real_mode_requires_privilege(self):
        if os.geteuid()==0: self.skipTest('Do not launch the real guardian as root in a test')
        p=subprocess.run([sys.executable,GUARD],capture_output=True,text=True,timeout=5)
        self.assertNotEqual(p.returncode,0)
        self.assertNotIn('ready',p.stdout)

if __name__=='__main__': unittest.main()
