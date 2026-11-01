#!/usr/bin/env python3
"""Fail deployment closed when Advent identity configuration is incomplete."""
import os
import re
import uuid


def parse_uuid(value: str) -> uuid.UUID:
    # Require canonical UUID spelling, a subset accepted by Java UUID.fromString.
    if not re.fullmatch(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", value):
        raise ValueError("invalid UUID encoding")
    return uuid.UUID(value)


def valid(troupe: str, excluded: str) -> bool:
    try:
        parse_uuid(troupe)
        ids = excluded.split(",")
        return len(ids) == 2 and len({parse_uuid(value.strip()) for value in ids}) == 2
    except (ValueError, AttributeError):
        return False


if __name__ == "__main__":
    if not valid(os.getenv("ADVENT_TROUPE_ID", ""), os.getenv("ADVENT_EXCLUDED_USER_IDS", "")):
        raise SystemExit("Advent troupe and two distinct excluded UUIDs are required")
