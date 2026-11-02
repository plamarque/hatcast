import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

GUARD = Path(__file__).with_name('check_reports.py')


class EvidenceContract(unittest.TestCase):
    def run_guard(self, xml, expected='required'):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'report.xml'
            if xml is not None:
                path.write_text(xml)
            return subprocess.run([sys.executable, str(GUARD), str(path), expected], capture_output=True, text=True)

    def test_passing_report_is_accepted(self):
        self.assertEqual(0, self.run_guard('<testsuite name="required"><testcase name="works"/></testsuite>').returncode)

    def test_empty_absent_skipped_and_failed_reports_are_rejected(self):
        for xml in (None, '<testsuites/>', '<testsuite name="required"/>',
                    '<testsuite name="required"><testcase><skipped/></testcase></testsuite>',
                    '<testsuite name="required" tests="2"><testcase/></testsuite>',
                    '<testsuite name="required" tests="1"><testcase/><testcase/></testsuite>',
                    '<testsuite name="required" tests="2"><testcase/><testcase><skipped/></testcase></testsuite>',
                    '<testsuite name="required"><testcase><failure/></testcase></testsuite>',
                    '<testsuite name="other"><testcase/></testsuite>'):
            with self.subTest(xml=xml):
                self.assertNotEqual(0, self.run_guard(xml).returncode)


if __name__ == '__main__':
    unittest.main()
