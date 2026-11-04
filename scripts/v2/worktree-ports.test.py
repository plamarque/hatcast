#!/usr/bin/env python3
import concurrent.futures
import fcntl
import time
import json
from pathlib import Path
import socket
import subprocess
import tempfile
import unittest

CONTROLLER = Path(__file__).with_name('worktree-ports.py').resolve()

def run(*cmd, cwd=None):
    return subprocess.check_output(cmd, cwd=cwd, text=True, stderr=subprocess.PIPE)

class Reservations(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name) / 'repo'
        self.root.mkdir()
        run('git', 'init', '-q', cwd=self.root)
        run('git', '-c', 'user.name=Test', '-c', 'user.email=test@example.test', 'commit', '--allow-empty', '-qm', 'init', cwd=self.root)
        self.other = Path(self.tmp.name) / 'other'
        run('git', 'worktree', 'add', '-qb', 'other', str(self.other), cwd=self.root)
    def tearDown(self): self.tmp.cleanup()
    def reserve(self, root, command='reserve'):
        output = run('python3', str(CONTROLLER), command, '--worktree', str(root))
        return dict(line.split('=') for line in output.splitlines())
    def test_parallel_rebuild_and_replacement(self):
        with concurrent.futures.ThreadPoolExecutor() as pool:
            a, b = list(pool.map(self.reserve, (self.root, self.other)))
        self.assertEqual(len(set(a.values()) | set(b.values())), 4)
        registry = self.root / '.local/worktree-ports/registry.json'
        registry.unlink()
        self.assertEqual(self.reserve(self.root), a)
        self.assertEqual(len(json.loads(registry.read_text())), 2)
        with socket.socket() as listener:
            listener.bind(('127.0.0.1', int(a['FRONT_PORT'])))
            listener.listen()
            replacement = self.reserve(self.root, 'start')
            self.assertTrue(set(replacement.values()).isdisjoint(set(a.values()) | set(b.values())))
        self.assertEqual(self.reserve(self.other), b)
    def test_worktrees_refreshed_after_lock_wait(self):
        first = self.reserve(self.root)
        shared = self.root / '.local/worktree-ports'
        used = {int(v) for v in first.values()}
        available = []
        for port in range(20000, 60000):
            if port in used: continue
            try:
                with socket.socket() as probe: probe.bind(('0.0.0.0', port))
            except OSError: continue
            available.append(port)
            if len(available) == 2: break
        with open(shared / 'lock', 'a+') as held:
            fcntl.flock(held, fcntl.LOCK_EX)
            proc = subprocess.Popen(['python3', str(CONTROLLER), 'reserve', '--worktree', str(self.other)],
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            time.sleep(0.2)
            third = Path(self.tmp.name) / 'third'
            run('git', 'worktree', 'add', '-qb', 'third', str(third), cwd=self.root)
            meta = third / '.local/worktree-ports.json'
            meta.parent.mkdir()
            meta.write_text(json.dumps({'front': available[0], 'api': available[1]}))
            fcntl.flock(held, fcntl.LOCK_UN)
        out, err = proc.communicate(timeout=10)
        self.assertEqual(proc.returncode, 0, err)
        pair = dict(line.split('=') for line in out.splitlines())
        self.assertTrue(set(pair.values()).isdisjoint(map(str, available)))
        self.assertIn(str(third.resolve()), json.loads((shared / 'registry.json').read_text()))

    def test_interrupted_transaction_recovers(self):
        self.reserve(self.root)
        shared = self.root / '.local/worktree-ports'
        meta = self.root / '.local/worktree-ports.json'
        old = json.loads(meta.read_text())
        new = {'front': 59000, 'api': 59001}
        journal = shared / 'transaction.json'
        journal.write_text(json.dumps({'path': str(self.root.resolve()), 'old': old, 'new': new}))
        meta.write_text(json.dumps(new))
        self.assertEqual(self.reserve(self.root, 'inspect'), {'FRONT_PORT': '59000', 'API_PORT': '59001'})
        self.assertEqual(json.loads((shared / 'registry.json').read_text())[str(self.root.resolve())], new)
        self.assertFalse(journal.exists())

    def test_removed_worktree_interrupted_transaction_recovers(self):
        self.reserve(self.other)
        shared = self.root / '.local/worktree-ports'
        meta = self.other / '.local/worktree-ports.json'
        old = json.loads(meta.read_text())
        new = {'front': 59000, 'api': 59001}
        journal = shared / 'transaction.json'
        journal.write_text(json.dumps({'path': str(self.other.resolve()), 'old': old, 'new': new}))
        meta.write_text(json.dumps(new))
        run('git', 'worktree', 'remove', '--force', str(self.other), cwd=self.root)
        self.reserve(self.root)
        self.assertFalse(journal.exists())
        self.assertNotIn(str(self.other.resolve()), json.loads((shared / 'registry.json').read_text()))

    def test_unregistered_existing_transaction_refused(self):
        self.reserve(self.other)
        shared = self.root / '.local/worktree-ports'
        meta = self.other / '.local/worktree-ports.json'
        old = json.loads(meta.read_text())
        journal = shared / 'transaction.json'
        journal.write_text(json.dumps({'path': str(self.other.resolve()), 'old': old, 'new': {'front': 59000, 'api': 59001}}))
        run('git', 'worktree', 'remove', '--force', str(self.other), cwd=self.root)
        self.other.mkdir()
        with self.assertRaises(subprocess.CalledProcessError): self.reserve(self.root)
        self.assertTrue(journal.exists())

    def test_stack_lock_blocks_other_launch(self):
        original = self.reserve(self.root)
        lock = self.root / '.local/worktree-stack.lock'
        lock.mkdir()
        (lock / 'owner').write_text('12345\n')
        with self.assertRaises(subprocess.CalledProcessError):
            self.reserve(self.root, 'start')
        output = run('python3', str(CONTROLLER), 'start', '--worktree', str(self.root), '--owner', '12345')
        self.assertEqual(dict(line.split('=') for line in output.splitlines()), original)

    def test_rejects_duplicate_metadata(self):
        self.reserve(self.root)
        meta = self.root / '.local/worktree-ports.json'
        dest = self.other / '.local/worktree-ports.json'
        dest.parent.mkdir(exist_ok=True)
        dest.write_text(meta.read_text())
        with self.assertRaises(subprocess.CalledProcessError): self.reserve(self.root)

if __name__ == '__main__': unittest.main()
