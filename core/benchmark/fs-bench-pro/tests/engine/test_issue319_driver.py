"""D-5's exact seven selections; owner E-1 separately names one large proof."""
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[5]
spec = importlib.util.spec_from_file_location('issue319_invoke', ROOT/'core/docs/issues/319/tools/invoke_case.py')
driver = importlib.util.module_from_spec(spec)
spec.loader.exec_module(driver)


class DriverPolicy(unittest.TestCase):
    def test_five_runs_and_two_preparations_get_300_seconds(self):
        self.assertEqual(len(driver.EXTENDED),7)
        self.assertEqual(sum(kind=='prepare' for kind,_ in driver.EXTENDED),2)
        for kind,item in driver.EXTENDED:
            with self.subTest(kind=kind,item=item):
                policy = driver.call_policy(kind,item)
                self.assertEqual(policy['outer_seconds'],300)
                self.assertLess(policy['driver_seconds'],300)
                self.assertIn('D-5',policy['reason'])
                self.assertIn('unchanged',policy['reason'])

    def test_other_phase_and_nearby_sizes_do_not_inherit_the_exception(self):
        for kind,item in driver.EXTENDED:
            for altered in ((('prepare' if kind=='run' else 'run'),item),
                            (kind,item+'-extra'),(kind,item.replace('500','100'))):
                if altered in driver.EXTENDED or altered in driver.EXTREME:
                    continue
                self.assertEqual(driver.call_policy(*altered)['outer_seconds'],118)
        for kind in ('clean','report','rows'):
            for _,item in driver.EXTENDED:
                self.assertEqual(driver.call_policy(kind,item)['outer_seconds'],118)


if __name__ == '__main__':
    unittest.main()
