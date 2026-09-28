import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


# The delivery controller is a versioned project command, not an installed
# skill payload. Installed skills only contain the activation instructions.
SCRIPT = Path(__file__).parents[1] / "github_review_decision_controller.py"


def connection(nodes):
    return {"nodes": nodes, "pageInfo": {"hasNextPage": False}}


class ControllerTests(unittest.TestCase):
    head = "a" * 40

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "v2"
        self.root.mkdir()
        self.controller = self.root / "scripts" / "v2" / "github_review_decision_controller.py"
        self.controller.parent.mkdir(parents=True)
        for source in ("github_review_decision_controller.py", "validate_pr_preflight.py"):
            destination = self.controller.parent / source
            destination.write_text((SCRIPT.parent / source).read_text(encoding="utf-8"), encoding="utf-8")
        for args in (("init",), ("config", "user.email", "test@example.invalid"), ("config", "user.name", "Test")):
            subprocess.run(["git", "-C", str(self.root), *args], check=True, capture_output=True)
        (self.root / "README").write_text("test\n", encoding="utf-8")
        subprocess.run(["git", "-C", str(self.root), "add", "README", "scripts"], check=True, capture_output=True)
        subprocess.run(["git", "-C", str(self.root), "commit", "-m", "test"], check=True, capture_output=True)
        subprocess.run(["git", "-C", str(self.root), "branch", "-M", "v2"], check=True, capture_output=True)
        self.bin = Path(self.temp.name) / "bin"
        self.bin.mkdir()
        self.snapshot_path = Path(self.temp.name) / "snapshot.json"
        self.log_path = Path(self.temp.name) / "gh.log"
        fake = self.bin / "gh"
        fake.write_text("""#!/usr/bin/env python3
import json, os, sys
snapshot_path = os.environ['FAKE_PR']
log = os.environ['FAKE_LOG']
args = sys.argv[1:]
with open(log, 'a') as handle: handle.write(' '.join(args) + '\\n')
pr = json.load(open(snapshot_path))
if args[:2] == ['pr', 'list']:
    print(json.dumps([{'number': pr['number'], 'url': pr['url']}]))
elif args[:2] == ['repo', 'view']:
    print(json.dumps({'nameWithOwner': 'example/hatcast'}))
elif args[:2] == ['api', 'graphql']:
    print(json.dumps({'data': {'repository': {'pullRequest': pr}}}))
elif args[:2] == ['pr', 'edit'] and '--add-label' in args:
    pr['labels']['nodes'] = [{'name': args[args.index('--add-label') + 1]}]
    json.dump(pr, open(snapshot_path, 'w'))
elif args[:2] == ['pr', 'comment']:
    pr['comments']['nodes'] = [{'author': {'login': 'patrice'}, 'body': args[args.index('--body') + 1]}]
    json.dump(pr, open(snapshot_path, 'w'))
else:
    raise SystemExit(2)
""", encoding="utf-8")
        fake.chmod(0o755)

    def tearDown(self):
        self.temp.cleanup()

    def snapshot(self, lanes=None, comments=None):
        return {"number": 42, "url": "https://github.com/example/hatcast/pull/42", "state": "OPEN", "baseRefName": "v2", "headRefName": "feat/example", "headRefOid": self.head, "labels": connection([{"name": lane} for lane in (lanes or [])]), "comments": connection(comments or []), "reviews": connection([]), "reviewThreads": connection([])}

    def run_controller(self, command, *extra):
        environment = os.environ | {"PATH": f"{self.bin}:{os.environ['PATH']}", "FAKE_PR": str(self.snapshot_path), "FAKE_LOG": str(self.log_path)}
        return subprocess.run(["python3", str(self.controller), command, "--story-key", "example", "--project-root", str(self.root), "--expected-owner", "patrice", *extra], capture_output=True, text=True, env=environment)

    def test_prepare_resolves_and_captures_complete_snapshot(self):
        self.snapshot_path.write_text(json.dumps(self.snapshot()), encoding="utf-8")
        result = self.run_controller("prepare")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout)["head_sha"], self.head)
        self.assertIn("api graphql", self.log_path.read_text(encoding="utf-8"))

    def test_record_writes_lane_and_attestation_then_rereads(self):
        self.snapshot_path.write_text(json.dumps(self.snapshot()), encoding="utf-8")
        result = self.run_controller("record", "--lane", "batch")
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.log_path.read_text(encoding="utf-8")
        self.assertIn("pr edit 42 --add-label delivery:batch", calls)
        self.assertIn("pr comment 42 --body HatCast delivery decision: lane=delivery:batch", calls)
        self.assertGreaterEqual(calls.count("api graphql"), 2)
        self.assertFalse((self.controller.parent / "__pycache__").exists())
        status = subprocess.run(["git", "-C", str(self.root), "status", "--porcelain"], check=True, capture_output=True, text=True)
        self.assertEqual(status.stdout, "")


if __name__ == "__main__":
    unittest.main()
