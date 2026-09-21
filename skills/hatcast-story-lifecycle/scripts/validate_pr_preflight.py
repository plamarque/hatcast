#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Validate a GitHub PR snapshot for the HatCast delivery controller."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


LANE_LABELS = {"delivery:batch", "delivery:release-now"}


def run_git(project_root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(project_root), *args],
        capture_output=True,
        check=False,
        text=True,
    )
    if result.returncode:
        raise RuntimeError(result.stderr.strip() or "git command failed")
    return result.stdout.strip()


def labels(pr: dict[str, Any]) -> list[str]:
    raw = pr.get("labels", [])
    if isinstance(raw, dict):
        raw = raw.get("nodes", [])
    return [item["name"] for item in raw if isinstance(item, dict) and isinstance(item.get("name"), str)]


def reviews(pr: dict[str, Any]) -> list[dict[str, Any]]:
    raw = pr.get("reviews", [])
    if isinstance(raw, dict):
        raw = raw.get("nodes", [])
    return [item for item in raw if isinstance(item, dict)]


def check_pr(pr: dict[str, Any], expected_owner: str | None, require_approval: bool) -> list[dict[str, Any]]:
    head = pr.get("headRefOid")
    branch = pr.get("headRefName")
    lane_labels = sorted(set(labels(pr)) & LANE_LABELS)
    checks = [
        {"name": "head_sha", "ok": isinstance(head, str) and len(head) >= 7, "detail": head or "missing"},
        {"name": "head_branch", "ok": isinstance(branch, str) and bool(branch), "detail": branch or "missing"},
        {"name": "delivery_label", "ok": len(lane_labels) == 1, "detail": lane_labels},
    ]
    if require_approval:
        approved_by_owner = any(
            review.get("state") == "APPROVED"
            and isinstance(review.get("author"), dict)
            and review["author"].get("login") == expected_owner
            for review in reviews(pr)
        )
        checks.append(
            {
                "name": "owner_approval",
                "ok": bool(expected_owner) and approved_by_owner,
                "detail": expected_owner or "missing expected owner",
            }
        )
    return checks


def check_v2(project_root: Path) -> list[dict[str, Any]]:
    branch = run_git(project_root, "branch", "--show-current")
    dirty = bool(run_git(project_root, "status", "--porcelain"))
    return [
        {"name": "v2_branch", "ok": branch == "v2", "detail": branch},
        {"name": "v2_clean", "ok": not dirty, "detail": "clean" if not dirty else "dirty"},
    ]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr-json", type=Path, required=True, help="GitHub CLI PR JSON snapshot")
    parser.add_argument("--project-root", type=Path, required=True, help="HatCast v2 checkout")
    parser.add_argument("--expected-owner", help="GitHub login that must have approved")
    parser.add_argument("--require-approval", action="store_true", help="Require approval from --expected-owner")
    args = parser.parse_args()

    try:
        pr = json.loads(args.pr_json.read_text(encoding="utf-8"))
        if not isinstance(pr, dict):
            raise ValueError("PR JSON must be an object")
        checks = check_pr(pr, args.expected_owner, args.require_approval) + check_v2(args.project_root)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError) as error:
        print(json.dumps({"ok": False, "error": str(error)}))
        return 2

    result = {
        "ok": all(check["ok"] for check in checks),
        "pr": {
            "number": pr.get("number"),
            "url": pr.get("url"),
            "head_sha": pr.get("headRefOid"),
            "head_branch": pr.get("headRefName"),
            "delivery_label": next((label for label in labels(pr) if label in LANE_LABELS), None),
        },
        "checks": checks,
    }
    print(json.dumps(result, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
