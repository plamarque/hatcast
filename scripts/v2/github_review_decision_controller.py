#!/usr/bin/env python3
"""Deterministic GitHub review-decision controller for one HatCast story.

This is a versioned project command. The ignored installed skill calls it.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

# The controller validates that its project checkout is clean before it records
# a decision.  Its own import must not invalidate that precondition.
sys.dont_write_bytecode = True

from validate_pr_preflight import LANE_LABELS, check_pr, check_v2


CORE_QUERY = """
query($owner:String!,$name:String!,$number:Int!) {
 repository(owner:$owner,name:$name) { pullRequest(number:$number) {
  number url state baseRefName headRefName headRefOid
 } }
}
"""

CONNECTION_SELECTIONS = {
    "labels": "nodes { name }",
    "comments": "nodes { author { login } body }",
    "reviews": "nodes { author { login } state submittedAt }",
    "reviewThreads": "nodes { isResolved }",
}


def gh(*args: str) -> str:
    result = subprocess.run(["gh", *args], check=False, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError("GitHub command failed")
    return result.stdout


def gh_json(*args: str) -> Any:
    try:
        return json.loads(gh(*args))
    except json.JSONDecodeError as error:
        raise RuntimeError("GitHub returned invalid JSON") from error


def resolve_pr(branch: str, create: bool) -> dict[str, Any]:
    matches = gh_json("pr", "list", "--head", branch, "--base", "v2", "--state", "open", "--json", "number,url")
    if not isinstance(matches, list):
        raise RuntimeError("GitHub returned invalid PR list")
    if not matches and create:
        gh("pr", "create", "--head", branch, "--base", "v2", "--fill")
        matches = gh_json("pr", "list", "--head", branch, "--base", "v2", "--state", "open", "--json", "number,url")
    if len(matches) != 1 or not isinstance(matches[0], dict):
        raise RuntimeError("expected exactly one open PR")
    return matches[0]


def graphql_pr(owner: str, name: str, number: int, query: str, cursor: str | None = None) -> dict[str, Any]:
    arguments = ["api", "graphql", "-f", f"query={query}", "-F", f"owner={owner}", "-F", f"name={name}", "-F", f"number={number}"]
    if cursor is not None:
        arguments.extend(("-F", f"after={cursor}"))
    result = gh_json(*arguments)
    try:
        pr = result["data"]["repository"]["pullRequest"]
    except (KeyError, TypeError) as error:
        raise RuntimeError("GitHub PR snapshot unavailable") from error
    if not isinstance(pr, dict):
        raise RuntimeError("GitHub PR snapshot unavailable")
    return pr


def capture_connection(owner: str, name: str, number: int, field: str) -> dict[str, Any]:
    selection = CONNECTION_SELECTIONS[field]
    query = f"""query($owner:String!,$name:String!,$number:Int!,$after:String) {{
 repository(owner:$owner,name:$name) {{ pullRequest(number:$number) {{
  {field}(first:100,after:$after) {{ {selection} pageInfo {{ hasNextPage endCursor }} }}
 }} }}
}}"""
    cursor = None
    nodes: list[dict[str, Any]] = []
    while True:
        connection = graphql_pr(owner, name, number, query, cursor).get(field)
        if not isinstance(connection, dict) or not isinstance(connection.get("nodes"), list) or not isinstance(connection.get("pageInfo"), dict):
            raise RuntimeError("GitHub PR connection unavailable")
        if not all(isinstance(node, dict) for node in connection["nodes"]):
            raise RuntimeError("GitHub PR connection unavailable")
        nodes.extend(connection["nodes"])
        page_info = connection["pageInfo"]
        if page_info.get("hasNextPage") is False:
            return {"nodes": nodes, "pageInfo": {"hasNextPage": False}}
        cursor = page_info.get("endCursor")
        if page_info.get("hasNextPage") is not True or not isinstance(cursor, str) or not cursor:
            raise RuntimeError("GitHub PR connection unavailable")


def snapshot(number: int) -> dict[str, Any]:
    repository = gh_json("repo", "view", "--json", "nameWithOwner")
    name_with_owner = repository.get("nameWithOwner") if isinstance(repository, dict) else None
    if not isinstance(name_with_owner, str) or "/" not in name_with_owner:
        raise RuntimeError("GitHub repository identity unavailable")
    owner, name = name_with_owner.split("/", 1)
    pr = graphql_pr(owner, name, number, CORE_QUERY)
    for field in CONNECTION_SELECTIONS:
        pr[field] = capture_connection(owner, name, number, field)
    return pr


def require_recording_preconditions(pr: dict[str, Any], owner: str, branch: str, project_root: Path) -> None:
    forbidden = {"delivery_label", "patrice_attestation"}
    checks = check_pr(pr, owner, branch) + check_v2(project_root)
    if any(not check["ok"] for check in checks if check["name"] not in forbidden):
        raise RuntimeError("review decision preconditions failed")
    lanes = sorted(set(label["name"] for label in pr["labels"]["nodes"] if isinstance(label.get("name"), str)) & LANE_LABELS)
    if len(lanes) > 1:
        raise RuntimeError("delivery lane is ambiguous")


def write_snapshot(pr: dict[str, Any]) -> Path:
    handle = tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", suffix=".json", delete=False)
    with handle:
        json.dump(pr, handle)
    return Path(handle.name)


def emit_preflight(pr: dict[str, Any], owner: str, branch: str, project_root: Path) -> int:
    checks = check_pr(pr, owner, branch) + check_v2(project_root)
    lanes = sorted(set(label["name"] for label in pr["labels"]["nodes"] if isinstance(label.get("name"), str)) & LANE_LABELS)
    print(json.dumps({"checks": checks, "ok": all(check["ok"] for check in checks), "pr": {"delivery_label": lanes[0] if len(lanes) == 1 else None, "head_sha": pr.get("headRefOid"), "number": pr.get("number"), "url": pr.get("url")}}, sort_keys=True))
    return 0 if all(check["ok"] for check in checks) else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("prepare", "record", "preflight"))
    parser.add_argument("--story-key", required=True)
    parser.add_argument("--project-root", type=Path, required=True)
    parser.add_argument("--expected-owner", required=True)
    parser.add_argument("--lane", choices=("batch", "release-now"))
    args = parser.parse_args()
    branch = f"feat/{args.story_key}"
    try:
        resolved = resolve_pr(branch, args.command == "prepare")
        number = resolved.get("number")
        if not isinstance(number, int):
            raise RuntimeError("GitHub PR identity unavailable")
        pr = snapshot(number)
        if args.command == "prepare":
            print(json.dumps({"head_sha": pr.get("headRefOid"), "number": pr.get("number"), "url": pr.get("url")}, sort_keys=True))
            return 0
        if args.command == "record":
            if not args.lane:
                raise RuntimeError("delivery lane required")
            require_recording_preconditions(pr, args.expected_owner, branch, args.project_root)
            lane = f"delivery:{args.lane}"
            current = sorted(set(label["name"] for label in pr["labels"]["nodes"] if isinstance(label.get("name"), str)) & LANE_LABELS)
            if current and current[0] != lane:
                gh("pr", "edit", str(number), "--remove-label", current[0])
            if current != [lane]:
                gh("pr", "edit", str(number), "--add-label", lane)
            gh("pr", "comment", str(number), "--body", f"HatCast delivery decision: lane={lane} head_sha={pr['headRefOid']}")
            pr = snapshot(number)
        return emit_preflight(pr, args.expected_owner, branch, args.project_root)
    except (OSError, RuntimeError, KeyError, TypeError):
        print(json.dumps({"error": "review controller unavailable", "ok": False}, sort_keys=True))
        return 2


if __name__ == "__main__":
    sys.exit(main())
