#!/usr/bin/env python3
"""Safely synchronize selected planned BMad entries in sprint-status.yaml.

This controller intentionally implements a narrower contract than BMad Sprint
Planning: it never regenerates, removes, reorders, or normalizes existing
tracking data.
"""

from __future__ import annotations

import argparse
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
EPIC_RE = re.compile(r"^### Epic ([0-9]+)\s+[—-]\s+.+$", re.MULTILINE)
STORY_RE = re.compile(r"^#### Story ([0-9]+)\.([0-9]+[a-z]?)\s*:\s*(.+?)\s*$", re.MULTILINE)
STATUS_ENTRY_RE = re.compile(r"^  ([a-z0-9]+(?:-[a-z0-9]+)*): ([a-z-]+)(?:[ \t]+#.*)?\r?$")


class SyncError(Exception):
    """A semantic refusal that must leave tracking untouched."""


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", ascii_value)).strip("-")


def canonical_tracking_keys(epics: str) -> list[str]:
    """Return canonical epic and story keys only from valid headings."""
    epic_matches = list(EPIC_RE.finditer(epics))
    if not epic_matches:
        raise SyncError("EPICS_MALFORMED")
    keys: list[str] = [f"epic-{match.group(1)}" for match in epic_matches]
    for story in STORY_RE.finditer(epics):
        enclosing = [match for match in epic_matches if match.start() < story.start()]
        if not enclosing:
            raise SyncError("EPICS_MALFORMED")
        epic, number, title = story.groups()
        if enclosing[-1].group(1) != epic:
            raise SyncError("EPICS_MALFORMED")
        key = f"{epic}-{number}-{slugify(title)}"
        if not KEY_RE.fullmatch(key):
            raise SyncError("EPICS_MALFORMED")
        keys.append(key)
    if not keys:
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
        if status not in LEGAL_STATUSES or key in statuses:
            raise SyncError("TRACKING_MALFORMED")
        statuses[key] = status
    return statuses


def parse_status_updates(values: list[str]) -> dict[str, str]:
    updates: dict[str, str] = {}
    for value in values:
        key, separator, status = value.partition("=")
        if separator != "=" or not KEY_RE.fullmatch(key) or status not in LEGAL_STATUSES or key in updates:
            raise SyncError("STATUS_UPDATE_INVALID")
        updates[key] = status
    return updates


def replace_statuses(lines: list[str], start: int, end: int, updates: dict[str, str]) -> list[str]:
    updated = list(lines)
    for index in range(start, end):
        match = STATUS_ENTRY_RE.fullmatch(updated[index].rstrip("\n"))
        if match and match.group(1) in updates:
            key, current = match.groups()
            updated[index] = updated[index].replace(f"{key}: {current}", f"{key}: {updates[key]}", 1)
    return updated


def atomic_write(path: Path, lines: list[str]) -> None:
    temporary_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    try:
        temporary_path.write_bytes("".join(lines).encode("utf-8"))
        os.chmod(temporary_path, path.stat().st_mode)
        os.replace(temporary_path, path)
    finally:
        temporary_path.unlink(missing_ok=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    operation = parser.add_mutually_exclusive_group(required=True)
    operation.add_argument("--story-key")
    operation.add_argument("--set-status", action="append", metavar="KEY=STATUS")
    args = parser.parse_args()

    try:
        if args.story_key is not None and not KEY_RE.fullmatch(args.story_key):
            raise SyncError("STORY_KEY_INVALID")
        epics_path = args.project_root / "_bmad-output/planning-artifacts/epics.md"
        tracking_path = args.project_root / "_bmad-output/implementation-artifacts/sprint-status.yaml"
        epics = epics_path.read_text(encoding="utf-8")
        canonical_keys = canonical_tracking_keys(epics)
        original = tracking_path.read_bytes()
        text = original.decode("utf-8")
        lines = text.splitlines(keepends=True)
        start, end = status_mapping_bounds(lines)
        statuses = parse_statuses(lines, start, end)
        historical_orphans = len(set(statuses) - set(canonical_keys))
        if args.story_key is not None:
            requested_count = canonical_keys.count(args.story_key)
            if requested_count == 0:
                raise SyncError("STORY_KEY_UNKNOWN")
            if requested_count > 1:
                raise SyncError("EPICS_AMBIGUOUS")
            if args.story_key in statuses:
                print("TRACKING=present")
                print(f"HISTORICAL_ORPHANS={historical_orphans}")
                return 0
            newline = "\r\n" if "\r\n" in text else "\n"
            if end > start and not lines[end - 1].endswith(("\n", "\r")):
                lines.insert(end, newline)
                end += 1
            lines.insert(end, f"  {args.story_key}: backlog{newline}")
            atomic_write(tracking_path, lines)
            print("TRACKING=added")
            print(f"HISTORICAL_ORPHANS={historical_orphans}")
            return 0

        updates = parse_status_updates(args.set_status or [])
        if not updates or any(key not in canonical_keys or key not in statuses for key in updates):
            raise SyncError("STATUS_UPDATE_UNKNOWN")
        changed = {key: status for key, status in updates.items() if statuses[key] != status}
        if changed:
            atomic_write(tracking_path, replace_statuses(lines, start, end, changed))
        print("TRACKING=updated" if changed else "TRACKING=present")
        for key in sorted(updates):
            print(f"STATUS={key}:{updates[key]}")
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
