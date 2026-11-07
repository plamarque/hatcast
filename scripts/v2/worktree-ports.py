#!/usr/bin/env python3
"""Reserve local development port pairs for registered Git worktrees."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import tempfile

META = '.local/worktree-ports.json'

def git(root, *args):
    return subprocess.check_output(['git', '-C', str(root), *args], text=True).strip()

def read(path):
    if path.is_symlink() or not path.is_file():
        raise ValueError(f'unsafe metadata: {path}')
    obj = json.loads(path.read_text())
    if (set(obj) != {'front', 'api'} or any(type(obj[k]) is not int or not 1024 <= obj[k] <= 65535 for k in obj)
            or obj['front'] == obj['api']):
        raise ValueError(f'invalid metadata: {path}')
    return obj

def write(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.is_symlink():
        raise ValueError(f'unsafe destination: {path}')
    fd, name = tempfile.mkstemp(prefix='.ports-', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(obj, f, sort_keys=True)
            f.write('\n')
            f.flush()
            os.fsync(f.fileno())
        os.replace(name, path)
    finally:
        if os.path.exists(name): os.unlink(name)

def free(port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('0.0.0.0', port))
        return True
    except OSError:
        return False

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('command', choices=['reserve', 'start', 'inspect'])
    p.add_argument('--worktree', default='.')
    p.add_argument('--owner', default='')
    args = p.parse_args()
    root = Path(git(args.worktree, 'rev-parse', '--show-toplevel')).resolve()
    lines = git(root, 'worktree', 'list', '--porcelain').splitlines()
    paths = [Path(x[9:]).resolve() for x in lines if x.startswith('worktree ')]
    if root not in paths: raise ValueError('worktree is not registered')
    shared = paths[0] / '.local' / 'worktree-ports'
    shared.mkdir(parents=True, exist_ok=True)
    lock = shared / 'lock'
    if lock.is_symlink(): raise ValueError('unsafe lock')
    with open(lock, 'a+') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        # Worktrees may have changed while this process was waiting for the lock.
        lines = git(root, 'worktree', 'list', '--porcelain').splitlines()
        paths = [Path(x[9:]).resolve() for x in lines if x.startswith('worktree ')]
        if root not in paths: raise ValueError('worktree is no longer registered')
        lock_dir = root / '.local/worktree-stack.lock'
        if args.command == 'start' and (lock_dir.exists() or lock_dir.is_symlink()):
            owner_file = lock_dir / 'owner'
            if (lock_dir.is_symlink() or owner_file.is_symlink() or not owner_file.is_file()
                    or not args.owner or owner_file.read_text().strip() != args.owner):
                raise ValueError('worktree stack lock is owned by another launch')
        assignments = {}
        used = set()
        for path in paths:
            meta = path / META
            if meta.exists() or meta.is_symlink():
                pair = read(meta)
                if used.intersection(pair.values()): raise ValueError('duplicate worktree reservations')
                used.update(pair.values())
                assignments[str(path)] = pair
        registry = shared / 'registry.json'
        journal = shared / 'transaction.json'
        recorded = None
        if registry.exists() or registry.is_symlink():
            if registry.is_symlink(): raise ValueError('unsafe registry')
            recorded = json.loads(registry.read_text())
            if not isinstance(recorded, dict): raise ValueError('invalid registry')
        # A journal proves which two states are part of an interrupted update.
        # Any unrelated discrepancy remains an error rather than being guessed away.
        if journal.exists() or journal.is_symlink():
            if journal.is_symlink() or not journal.is_file(): raise ValueError('unsafe transaction')
            transaction = json.loads(journal.read_text())
            if not isinstance(transaction, dict) or set(transaction) != {'path', 'old', 'new'}:
                raise ValueError('invalid transaction')
            path, old, new = transaction['path'], transaction['old'], transaction['new']
            def valid_pair(pair):
                return (isinstance(pair, dict) and set(pair) == {'front', 'api'}
                        and all(type(v) is int and 1024 <= v <= 65535 for v in pair.values())
                        and pair['front'] != pair['api'])
            if (not isinstance(path, str) or not Path(path).is_absolute()
                    or str(Path(path).resolve()) != path
                    or not valid_pair(new) or (old is not None and not valid_pair(old))):
                raise ValueError('invalid transaction identity')
            if path not in map(str, paths):
                # A removed worktree no longer owns a reservation. Refuse an
                # unregistered path that still exists: its identity is ambiguous.
                missing = Path(path)
                if missing.exists() or missing.is_symlink():
                    raise ValueError('transaction worktree is unregistered but still exists')
                if recorded is not None and path in recorded and recorded[path] not in (old, new):
                    raise ValueError('transaction registry conflict')
                if recorded is not None: recorded.pop(path, None)
            else:
                actual = assignments.get(path)
                if actual != old and actual != new: raise ValueError('transaction metadata conflict')
                if recorded is not None:
                    previous = recorded.get(path)
                    if previous != old and not (actual == new and previous == new):
                        raise ValueError('transaction registry conflict')
                    if actual is None: recorded.pop(path, None)
                    else: recorded[path] = actual

        if recorded is not None:
            for path, pair in recorded.items():
                if path in map(str, paths) and assignments.get(path) != pair:
                    raise ValueError('registry and worktree metadata disagree')
        if journal.exists():
            write(registry, assignments)
            journal.unlink()
        key = str(root)
        pair = assignments.get(key)
        if args.command == 'inspect':
            if pair is None: raise ValueError('no reservation')
        elif pair is None or (args.command == 'start' and not all(free(n) for n in pair.values())):
            candidates = (n for n in range(20000, 60000) if n not in used and free(n))
            old = pair
            pair = {'front': next(candidates), 'api': next(candidates)}
            write(journal, {'path': key, 'old': old, 'new': pair})
            write(root / META, pair)
            assignments[key] = pair
        write(registry, assignments)
        if journal.exists(): journal.unlink()
        print(f"FRONT_PORT={pair['front']}")
        print(f"API_PORT={pair['api']}")

if __name__ == '__main__':
    try: main()
    except (OSError, ValueError, KeyError, StopIteration, subprocess.CalledProcessError, json.JSONDecodeError) as e:
        print(f'ERROR: port reservation failed: {e}', file=sys.stderr)
        sys.exit(1)
