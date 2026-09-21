import importlib.util
from pathlib import Path
import unittest


SCRIPT = Path(__file__).parents[1] / "validate_pr_preflight.py"
SPEC = importlib.util.spec_from_file_location("validate_pr_preflight", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class PreflightTests(unittest.TestCase):
    def test_accepts_one_lane_and_owner_approval(self):
        checks = MODULE.check_pr(
            {
                "headRefOid": "a" * 40,
                "headRefName": "feat/example",
                "labels": [{"name": "delivery:batch"}],
                "reviews": [{"state": "APPROVED", "author": {"login": "patrice"}}],
            },
            "patrice",
            True,
        )
        self.assertTrue(all(check["ok"] for check in checks))

    def test_rejects_missing_or_multiple_delivery_labels(self):
        base = {"headRefOid": "a" * 40, "headRefName": "feat/example", "reviews": []}
        missing = next(check for check in MODULE.check_pr(base, None, False) if check["name"] == "delivery_label")
        self.assertFalse(missing["ok"])
        base["labels"] = [{"name": "delivery:batch"}, {"name": "delivery:release-now"}]
        duplicate = next(check for check in MODULE.check_pr(base, None, False) if check["name"] == "delivery_label")
        self.assertFalse(duplicate["ok"])
