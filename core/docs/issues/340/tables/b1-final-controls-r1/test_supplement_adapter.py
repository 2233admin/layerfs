import unittest
from collections import Counter
from supplement_adapter import exact_key as adapter_exact_key, decide


def exact_key(row):
    return adapter_exact_key(row,{'a'*64,'b'*64,'12'+'c'*64})


class ExactSupplementIdentity(unittest.TestCase):
    def row(self, ref='a'*64):
        return {'agent':'main','step':'same','method':'fs.list','args':{'ref':ref,'path':'/node_modules','pageSize':1000,'pagePos':0}}

    def test_equal_step_different_full_ref_joins_uniquely_and_aliases_match(self):
        first, second = self.row(), self.row('b'*64)
        trace = self.row()
        trace['args']['branch'] = trace['args'].pop('ref')
        self.assertEqual(exact_key(first),exact_key(trace))
        index = {exact_key(first):['one'],exact_key(second):['two']}
        counts = Counter({exact_key(first):1,exact_key(second):1})
        self.assertEqual(decide(exact_key(first),index,counts),'matched')
        self.assertNotEqual(exact_key(first),exact_key(second))

    def test_duplicate_full_trace_and_receipt_keys_quarantined(self):
        key = exact_key(self.row())
        self.assertEqual(decide(key,{key:['one','two']},Counter({key:1})),'ambiguous')
        self.assertEqual(decide(key,{key:['one']},Counter({key:2})),'ambiguous')

    def test_missing_truncated_and_wrong_type_discriminators_rejected(self):
        for field in ['ref','path','pageSize','pagePos']:
            row = self.row()
            del row['args'][field]
            with self.assertRaises(ValueError):
                exact_key(row)
        for ref in ['a'*63,'a'*63+'…','main']:
            with self.assertRaises(ValueError):
                exact_key(self.row(ref))
        row = self.row()
        row['args']['pagePos'] = False
        with self.assertRaises(ValueError):
            exact_key(row)
        row = self.row()
        row['argsTruncated'] = True
        with self.assertRaises(ValueError):
            exact_key(row)

    def test_optional_line_pattern_and_alias_mismatches_do_not_join(self):
        first, second = self.row(), self.row()
        second['args']['pattern'] = '*.js'
        self.assertNotEqual(exact_key(first),exact_key(second))
        first['args']['branch'] = 'b'*64
        with self.assertRaises(ValueError):
            exact_key(first)

    def test_actual_tagged_commit_ref_is_not_rejected_as_a_sha_digest(self):
        row = self.row('12'+'c'*64)
        self.assertIsInstance(exact_key(row),str)


if __name__=='__main__':
    unittest.main()
