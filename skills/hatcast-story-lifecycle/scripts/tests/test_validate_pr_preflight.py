import json
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPT = Path(__file__).parents[1] / "validate_pr_preflight.py"


def connection(nodes):
    return {"nodes": nodes, "pageInfo": {"hasNextPage": False}}


class PreflightCliTests(unittest.TestCase):
    owner = "patrice"
    branch = "feat/example"
    head = "a" * 40

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / "v2"
        self.root.mkdir()
        for args in (("init",), ("config", "user.email", "test@example.invalid"), ("config", "user.name", "Test")):
            subprocess.run(["git", "-C", str(self.root), *args], check=True, capture_output=True)
        (self.root / "README").write_text("test\n", encoding="utf-8")
        subprocess.run(["git", "-C", str(self.root), "add", "README"], check=True, capture_output=True)
        subprocess.run(["git", "-C", str(self.root), "commit", "-m", "test"], check=True, capture_output=True)
        subprocess.run(["git", "-C", str(self.root), "branch", "-M", "v2"], check=True, capture_output=True)

    def tearDown(self):
        self.temp.cleanup()

    def snapshot(self, **overrides):
        pr = {
            "number": 42,
            "url": "https://github.com/example/hatcast/pull/42",
            "state": "OPEN",
            "baseRefName": "v2",
            "headRefName": self.branch,
            "headRefOid": self.head,
            "labels": connection([{"name": "delivery:batch"}]),
            "comments": connection([{"author": {"login": self.owner}, "body": f"HatCast delivery decision: lane=delivery:batch head_sha={self.head}"}]),
            "reviews": connection([]),
            "reviewThreads": connection([]),
        }
        pr.update(overrides)
        return pr

    def run_cli(self, snapshot):
        fixture = Path(self.temp.name) / "pr.json"
        fixture.write_text(json.dumps(snapshot), encoding="utf-8")
        return subprocess.run(
            ["python3", str(SCRIPT), "--pr-json", str(fixture), "--project-root", str(self.root), "--expected-owner", self.owner, "--expected-branch", self.branch],
            capture_output=True,
            text=True,
        )

    def assert_refused(self, snapshot):
        result = self.run_cli(snapshot)
        self.assertEqual(result.returncode, 1, result.stderr)
        return json.loads(result.stdout)

    def test_cli_accepts_complete_current_decision(self):
        result = self.run_cli(self.snapshot())
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(json.loads(result.stdout)["ok"])

    def test_cli_rejects_dirty_v2(self):
        (self.root / "dirty").write_text("x", encoding="utf-8")
        output = self.assert_refused(self.snapshot())
        self.assertFalse(next(item for item in output["checks"] if item["name"] == "v2_clean")["ok"])

    def test_cli_rejects_missing_identity_and_wrong_branch_or_state(self):
        self.assert_refused(self.snapshot(number=None, url=None))
        self.assert_refused(self.snapshot(headRefName="feat/other"))
        self.assert_refused(self.snapshot(state="CLOSED"))

    def test_cli_rejects_malformed_and_incomplete_connections(self):
        malformed = Path(self.temp.name) / "malformed.json"
        malformed.write_text("{", encoding="utf-8")
        result = subprocess.run(["python3", str(SCRIPT), "--pr-json", str(malformed), "--project-root", str(self.root), "--expected-owner", self.owner, "--expected-branch", self.branch], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(json.loads(result.stdout)["error"], "preflight input unavailable")
        incomplete = self.snapshot(reviews={"nodes": [], "pageInfo": {"hasNextPage": True}})
        self.assert_refused(incomplete)
        self.assert_refused(self.snapshot(reviewThreads={"nodes": [], "pageInfo": {"hasNextPage": True}}))

    def test_cli_rejects_lane_change_and_missing_attestation(self):
        changed_lane = self.snapshot(labels=connection([{"name": "delivery:release-now"}]))
        self.assert_refused(changed_lane)
        self.assert_refused(self.snapshot(comments=connection([])))

    def test_historical_requested_changes_do_not_block_repaired_review(self):
        reviews = connection([
            {"author": {"login": "reviewer"}, "state": "CHANGES_REQUESTED", "submittedAt": "2026-01-01T00:00:00Z"},
            {"author": {"login": "reviewer"}, "state": "COMMENTED", "submittedAt": "2026-01-02T00:00:00Z"},
        ])
        result = self.run_cli(self.snapshot(reviews=reviews))
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_current_requested_changes_and_unresolved_thread_block(self):
        reviews = connection([{"author": {"login": "reviewer"}, "state": "CHANGES_REQUESTED", "submittedAt": "2026-01-02T00:00:00Z"}])
        self.assert_refused(self.snapshot(reviews=reviews))
        self.assert_refused(self.snapshot(reviewThreads=connection([{"isResolved": False}])))


if __name__ == "__main__":
    unittest.main()
