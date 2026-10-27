#!/usr/bin/env python3
"""Add exactly one planned BMad story to sprint-status.yaml.

This controller intentionally implements a narrower contract than BMad Sprint
Planning: it never regenerates, removes, or rewrites existing tracking data.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import sys
import unicodedata
from pathlib import Path


LEGAL_STATUSES = {
    "awaiting-operator", "backlog", "cancelled", "done", "in-progress",
    "optional", "ready-for-dev", "review",
}
KEY_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
EPIC_RE = re.compile(r"^#{1,3}\s*Epic\s+(\d+)(?=\s|[:—-]|$)\s*(?:[:—-]\s*)?.*$", re.IGNORECASE)
STORY_RE = re.compile(r"^#{2,4}\s*Story\s+(\d+)\.(\d+[a-z]?)\s*:\s*(.+?)\s*$", re.IGNORECASE)
FENCE_RE = re.compile(r"^\s{0,3}(`{3,}|~{3,})")
STATUS_ENTRY_RE = re.compile(r"^  ([^\s:]+): ([a-z-]+)(?:[ \t]+#.*)?\r?$")


class SyncError(Exception):
    """A semantic refusal that must leave tracking untouched."""


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", ascii_value)).strip("-")


def planner_slug(value: str) -> str:
    slug = re.sub(r"[^\w]+", "-", value.lower(), flags=re.UNICODE).strip("-")[:60].strip("-")
    return slug or hashlib.sha256(value.encode("utf-8")).hexdigest()[:8]


def canonical_tracking_keys(documents: list[str]) -> list[str]:
    """Parse each independent epic document without accepting fenced examples."""
    keys: list[str] = []
    for index, document in enumerate(documents):
        epic = None
        found_epic = False
        fence = None
        for line in document.splitlines():
            match = FENCE_RE.match(line)
            if match:
                marker = match.group(1)
                if fence is None:
                    fence = (marker[0], len(marker))
                elif marker[0] == fence[0] and len(marker) >= fence[1] and not line[match.end():].strip():
                    fence = None
                continue
            if fence is not None:
                continue
            match = EPIC_RE.match(line)
            if match:
                epic = match.group(1)
                found_epic = True
                keys.append(f"epic-{epic}")
                continue
            match = STORY_RE.match(line)
            if match:
                story_epic, number, title = match.groups()
                if epic != story_epic:
                    raise SyncError("EPICS_MALFORMED")
                slug = slugify(title) if index == 0 else planner_slug(title)
                keys.append(f"{story_epic}-{number}-{slug}")
        if not found_epic:
            raise SyncError("EPICS_MALFORMED")
    return keys


def status_mapping_bounds(lines: list[str]) -> tuple[int, int]:
    matches = [index for index, line in enumerate(lines) if line.rstrip("\r\n") == "development_status:"]
    if len(matches) != 1:
        raise SyncError("TRACKING_MALFORMED")
    start = matches[0] + 1
    end = len(lines)
    for index in range(start, len(lines)):
        line = lines[index]
        if line and not line[0].isspace() and line.strip() and not line.lstrip().startswith("#"):
            end = index
            break
    return start, end


def parse_statuses(lines: list[str], start: int, end: int) -> dict[str, str]:
    statuses: dict[str, str] = {}
    for line in lines[start:end]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        match = STATUS_ENTRY_RE.fullmatch(line.rstrip("\n"))
        if not match:
            raise SyncError("TRACKING_MALFORMED")
        key, status = match.groups()
        canonical_key = slugify(key)
        if (
            status not in LEGAL_STATUSES
            or not KEY_RE.fullmatch(canonical_key)
            or canonical_key in statuses
        ):
            raise SyncError("TRACKING_MALFORMED")
        statuses[canonical_key] = status
    return statuses


def main() -> int:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--story-key", required=True)
    args = parser.parse_args()

    try:
        if not KEY_RE.fullmatch(args.story_key):
            raise SyncError("STORY_KEY_INVALID")
        epics_path = args.project_root / "_bmad-output/planning-artifacts/epics.md"
        tracking_path = args.project_root / "_bmad-output/implementation-artifacts/sprint-status.yaml"
        documents = [epics_path.read_text(encoding="utf-8")]
        association_path = epics_path.parent / "association-groups" / "epics.md"
        if association_path.exists():
            documents.append(association_path.read_text(encoding="utf-8"))
        canonical_keys = canonical_tracking_keys(documents)
        matches = [key for key in canonical_keys if slugify(key) == args.story_key]
        requested_count = len(matches)
        if requested_count == 0:
            raise SyncError("STORY_KEY_UNKNOWN")
        if requested_count > 1:
            raise SyncError("EPICS_AMBIGUOUS")
        original = tracking_path.read_bytes()
        text = original.decode("utf-8")
        lines = text.splitlines(keepends=True)
        start, end = status_mapping_bounds(lines)
        statuses = parse_statuses(lines, start, end)
        historical_orphans = len(set(statuses) - {slugify(key) for key in canonical_keys})
        if args.story_key in statuses:
            print("TRACKING=present")
            print(f"HISTORICAL_ORPHANS={historical_orphans}")
            return 0
        newline = "\r\n" if "\r\n" in text else "\n"
        if end > start and not lines[end - 1].endswith(("\n", "\r")):
            lines.insert(end, newline)
            end += 1
        lines.insert(end, f"  {matches[0]}: backlog{newline}")
        temporary_path = tracking_path.with_name(f".{tracking_path.name}.{os.getpid()}.tmp")
        try:
            temporary_path.write_bytes("".join(lines).encode("utf-8"))
            os.chmod(temporary_path, tracking_path.stat().st_mode)
            os.replace(temporary_path, tracking_path)
        finally:
            temporary_path.unlink(missing_ok=True)
        print("TRACKING=added")
        print(f"HISTORICAL_ORPHANS={historical_orphans}")
        return 0
    except (OSError, UnicodeError):
        print("ERROR=IO_FAILURE", file=sys.stderr)
        return 1
    except SyncError as error:
        print(f"ERROR={error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
