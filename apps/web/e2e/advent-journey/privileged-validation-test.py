import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch

path=Path(__file__).with_name('privileged-validation.py')
spec=importlib.util.spec_from_file_location('guardian_validation',path)
module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
class ValidationTest(unittest.TestCase):
    def test_failure_after_guardian_killed_attempts_recovery(self):
        original=module.recover
        with patch.object(module,'recover',wraps=original) as recover:
            with self.assertRaises(RuntimeError): module.validate(True,fail_after_kill=True)
            self.assertEqual(recover.call_count,1)
if __name__=='__main__': unittest.main()
