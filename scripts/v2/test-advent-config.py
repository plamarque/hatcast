#!/usr/bin/env python3
"""Exercise the same executable validation used by deployment."""
import os
import subprocess
from pathlib import Path

script = Path(__file__).with_name("validate-advent-config.py")
a = "a0000001-0000-4000-8000-000000000001"
b = "d0000001-0000-4000-8000-000000000002"
c = "d0000001-0000-4000-8000-000000000003"
for troupe, excluded, expected in [(a, f"{b},{c}", 0), ("", f"{b},{c}", 1), ("bad", f"{b},{c}", 1), (a, "", 1), (a, b, 1), (a, f"{b},{b}", 1), (a, f"{b},bad", 1), (a, f"{b},{c},{a}", 1), (a.replace("-", ""), f"{b},{c}", 1), (a, f"{{{b}}},{c}", 1)]:
    env = {**os.environ, "ADVENT_TROUPE_ID": troupe, "ADVENT_EXCLUDED_USER_IDS": excluded}
    result = subprocess.run(["python3", str(script)], env=env, capture_output=True)
    assert result.returncode == expected, (troupe, excluded, result.returncode)
print("PASS: deployment configuration accepts valid IDs and rejects invalid cases including non-Java UUID encodings")
