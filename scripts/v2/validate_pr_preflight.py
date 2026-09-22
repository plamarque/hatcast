#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# ///
"""Validate a complete GitHub PR snapshot for HatCast delivery.

This is a versioned project command. The ignored installed skill calls it.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


LANE_LABELS = {"delivery:batch", "delivery:release-now"}
SHA_PATTERN = re.compile(r"[0-9a-f]{40}")
ATTESTATION_PATTERN = re.compile(
    r"^HatCast delivery decision: lane=(delivery:batch|delivery:release-now) "
    r"head_sha=([0-9a-f]{40})$",
    re.MULTILINE,
)


def run_git(project_root: Path, *args: str) -> str:
    result = subprocess.run(["git", "-C", str(project_root), *args], capture_output=True, check=False, text=True)
    if result.returncode:
        # Git output may contain local filesystem or credential-adjacent details.
        raise RuntimeError("git command failed")
    return result.stdout.strip()


def complete_nodes(pr: dict[str, Any], field: str) -> tuple[list[dict[str, Any]], bool]:
    connection = pr.get(field)
    if not isinstance(connection, dict):
        return [], False
    nodes = connection.get("nodes")
    page_info = connection.get("pageInfo")
    if not isinstance(nodes, list) or not all(isinstance(node, dict) for node in nodes):
        return [], False
    if not isinstance(page_info, dict) or page_info.get("hasNextPage") is not False:
        return [], False
    return nodes, True


def labels(pr: dict[str, Any]) -> list[str]:
    nodes, complete = complete_nodes(pr, "labels")
    if not complete:
        return []
    return [node["name"] for node in nodes if isinstance(node.get("name"), str)]


def exact_pr(snapshot: Any) -> dict[str, Any]:
    if isinstance(snapshot, dict):
        return snapshot
    if isinstance(snapshot, list) and len(snapshot) == 1 and isinstance(snapshot[0], dict):
        return snapshot[0]
    raise ValueError("expected exactly one pull request")


def current_review_state(pr: dict[str, Any]) -> tuple[bool, bool]:
    reviews, complete = complete_nodes(pr, "reviews")
    if not complete:
        return False, False
    latest_by_author: dict[str, tuple[str, str]] = {}
    for review in reviews:
        author = review.get("author")
        state = review.get("state")
        submitted_at = review.get("submittedAt")
        if not isinstance(author, dict) or not isinstance(author.get("login"), str):
            return False, False
        if not isinstance(state, str) or not isinstance(submitted_at, str):
            return False, False
        login = author["login"]
        if login not in latest_by_author or submitted_at > latest_by_author[login][0]:
            latest_by_author[login] = (submitted_at, state)
    return True, any(state == "CHANGES_REQUESTED" for _, state in latest_by_author.values())


def has_current_attestation(pr: dict[str, Any], expected_owner: str | None, lane: str | None) -> tuple[bool, bool]:
    comments, complete = complete_nodes(pr, "comments")
    head = pr.get("headRefOid")
    if not complete or not isinstance(expected_owner, str) or not isinstance(head, str) or lane not in LANE_LABELS:
        return False, complete
    for comment in comments:
        author = comment.get("author")
        body = comment.get("body")
        if not isinstance(author, dict) or author.get("login") != expected_owner or not isinstance(body, str):
            continue
        if (lane, head) in ATTESTATION_PATTERN.findall(body):
            return True, True
    return False, True


def check_pr(pr: dict[str, Any], expected_owner: str, expected_branch: str) -> list[dict[str, Any]]:
    head = pr.get("headRefOid")
    lane_labels = sorted(set(labels(pr)) & LANE_LABELS)
    lane = lane_labels[0] if len(lane_labels) == 1 else None
    reviews_complete, requested_changes = current_review_state(pr)
    threads, threads_complete = complete_nodes(pr, "reviewThreads")
    attested, comments_complete = has_current_attestation(pr, expected_owner, lane)
    return [
        {"name": "pr_identity", "ok": type(pr.get("number")) is int and pr["number"] > 0 and isinstance(pr.get("url"), str) and pr["url"].startswith("https://"), "detail": "present" if type(pr.get("number")) is int and isinstance(pr.get("url"), str) else "missing"},
        {"name": "pr_open", "ok": pr.get("state") == "OPEN", "detail": "open" if pr.get("state") == "OPEN" else "not_open"},
        {"name": "base_branch", "ok": pr.get("baseRefName") == "v2", "detail": "v2" if pr.get("baseRefName") == "v2" else "not_v2"},
        {"name": "head_sha", "ok": isinstance(head, str) and bool(SHA_PATTERN.fullmatch(head)), "detail": "present" if isinstance(head, str) else "missing"},
        {"name": "head_branch", "ok": pr.get("headRefName") == expected_branch, "detail": "expected" if pr.get("headRefName") == expected_branch else "unexpected"},
        {"name": "delivery_label", "ok": len(lane_labels) == 1, "detail": lane_labels},
        {"name": "comments_complete", "ok": comments_complete, "detail": "complete" if comments_complete else "incomplete"},
        {"name": "patrice_attestation", "ok": attested, "detail": "current" if attested else "missing_or_stale"},
        {"name": "reviews_complete", "ok": reviews_complete, "detail": "complete" if reviews_complete else "incomplete"},
        {"name": "requested_changes", "ok": reviews_complete and not requested_changes, "detail": "clear" if reviews_complete and not requested_changes else "present_or_incomplete"},
        {"name": "review_threads_complete", "ok": threads_complete, "detail": "complete" if threads_complete else "incomplete"},
        {"name": "blocking_threads", "ok": threads_complete and not any(thread.get("isResolved") is False for thread in threads), "detail": "clear" if threads_complete and not any(thread.get("isResolved") is False for thread in threads) else "unresolved_or_incomplete"},
    ]


def check_v2(project_root: Path) -> list[dict[str, Any]]:
    branch = run_git(project_root, "branch", "--show-current")
    dirty = bool(run_git(project_root, "status", "--porcelain"))
    return [{"name": "v2_branch", "ok": branch == "v2", "detail": branch}, {"name": "v2_clean", "ok": not dirty, "detail": "clean" if not dirty else "dirty"}]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr-json", type=Path, required=True)
    parser.add_argument("--project-root", type=Path, required=True)
    parser.add_argument("--expected-owner", required=True)
    parser.add_argument("--expected-branch", required=True)
    args = parser.parse_args()
    try:
        pr = exact_pr(json.loads(args.pr_json.read_text(encoding="utf-8")))
        checks = check_pr(pr, args.expected_owner, args.expected_branch) + check_v2(args.project_root)
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError):
        print(json.dumps({"error": "preflight input unavailable", "ok": False}, sort_keys=True))
        return 2
    lane_labels = sorted(set(labels(pr)) & LANE_LABELS)
    print(json.dumps({"checks": checks, "ok": all(check["ok"] for check in checks), "pr": {"delivery_label": lane_labels[0] if len(lane_labels) == 1 else None, "head_branch": pr.get("headRefName"), "head_sha": pr.get("headRefOid"), "number": pr.get("number"), "url": pr.get("url")}}, indent=2, sort_keys=True))
    return 0 if all(check["ok"] for check in checks) else 1


if __name__ == "__main__":
    sys.exit(main())
