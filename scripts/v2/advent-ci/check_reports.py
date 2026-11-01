#!/usr/bin/env python3
"""Fail closed when required Advent JUnit suites have no successful execution."""
import argparse
import glob
import os
import sys
import xml.etree.ElementTree as ET


def check(pattern, expected):
    files = glob.glob(pattern)
    if not files:
        raise ValueError(f'No reports match {pattern}')
    suites = []
    for filename in files:
        root = ET.parse(filename).getroot()
        suites.extend(root.iter('testsuite'))
    for name in expected:
        matches = [suite for suite in suites if suite.get('name', '').endswith(name)]
        if len(matches) != 1:
            raise ValueError(f'{name}: expected one suite, found {len(matches)}')
        suite = matches[0]
        cases = suite.findall('testcase')
        if suite.get('tests') is not None and int(suite.get('tests')) != len(cases):
            raise ValueError(f'{name}: declared tests count does not match testcase elements')
        failures = sum(any(c.find(tag) is not None for tag in ('failure', 'error')) for c in cases)
        skipped = sum(c.find('skipped') is not None for c in cases)
        executed = len(cases) - skipped
        print(f'{name}: tests={len(cases)} executed={executed} failures={failures} skipped={skipped} duration={suite.get("time", "unknown")}s timestamp={suite.get("timestamp", "unknown")}')
        if not executed or skipped or failures or int(suite.get('failures', '0')) or int(suite.get('errors', '0')) or int(suite.get('skipped', '0')):
            raise ValueError(f'{name}: required tests must execute and pass without skips')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pattern')
    parser.add_argument('suite', nargs='+')
    args = parser.parse_args()
    print(f'candidate SHA: {os.environ.get("GITHUB_SHA", "local/unset")}')
    try:
        check(args.pattern, args.suite)
    except (ValueError, OSError, ET.ParseError) as exc:
        print(f'Invalid test evidence: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
