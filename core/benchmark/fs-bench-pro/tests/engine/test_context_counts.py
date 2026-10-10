"""Concurrent counts use one shared delta and actual per-channel observer costs."""
import copy
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

BENCH = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(BENCH))
from engine import workspace


class ContextCounts(unittest.TestCase):
    def fixture(self):
        scopes = ['01' * 32, '02' * 32]
        daemon = (1, 2, 3, 4)
        words = lambda value: tuple(int(value[index:index+16], 16) for index in range(0, 64, 16))
        groups, values, events = {}, {}, []
        def event(name, channel, before=None, after=None):
            fields = {'channel': channel, 'scope': scopes[channel], 'key': str(channel)}
            if before is not None:
                fields.update(control_send_records_before=before, control_send_records_after=after)
            if name == 'control_origin':
                fields['control_send_records'] = 1
            row = {'event': name, 'sequence': len(events)+1, 'fields': fields}
            events.append(row)
        def group(channel, call, code, admitted=50, sql=80, request=0):
            header = {'daemon': list(daemon), 'scope': list(words(scopes[channel])), 'call': call}
            key = (daemon, words(scopes[channel]), call)
            groups[key] = [header]
            values[key] = {'identity': key, 'operation_tag': code, 'owner': {'admitted': admitted},
                'sql_foreground': [{'executions': sql}, {'executions': 0}],
                'observer': {'completion_available': True, 'sql': {'executions': 1}},
                'native': {'owner_id': channel+11}, 'opcodes': {'by_opcode': [request, 0]}}
        event('control_origin', 0); event('control_origin', 1)
        event('fork', 0, 1, 2)
        event('mount', 0, 2, 4); group(0, 3, 1, 8, 8); group(0, 4, 9, 10, 10)
        event('fork', 0, 4, 5)
        event('mount', 1, 1, 3); group(1, 2, 1); group(1, 3, 9)
        event('commit', 0, 5, 6); group(0, 6, 2)
        event('commit', 1, 3, 4); group(1, 4, 2)
        event('workspace_status', 0, 6, 7); group(0, 7, 3)
        event('workspace_status', 1, 4, 5); group(1, 5, 3)
        event('unmount', 0, 7, 8); group(0, 8, 4, request=100)
        event('cleanup', 0, 8, 9); group(0, 9, 13)
        event('unmount', 1, 5, 6); group(1, 6, 4, request=200)
        event('cleanup', 1, 6, 7); group(1, 7, 13)
        return groups, values, events

    def test_shared_delta_is_not_summed_per_worker(self):
        groups, values, events = self.fixture()
        with patch.object(workspace.counts, 'decode', side_effect=lambda group: values[workspace.counts.identity(group)]):
            result = workspace.context_numeric_counts(groups, events)
        self.assertEqual(result['totals'], {'requests': 300, 'owner_jobs': 34, 'statements': 64})
        self.assertEqual(result['observer'], {'jobs': 6, 'statement_executions': 6})
        self.assertEqual(len(result['kernel_connections']), 2)

    def test_missing_original_group_or_shared_scope_is_refused(self):
        groups, values, events = self.fixture()
        with patch.object(workspace.counts, 'decode', side_effect=lambda group: values[workspace.counts.identity(group)]):
            missing = dict(groups)
            missing.pop(next(key for key in groups if key[2] == 4))
            with self.assertRaises(ValueError):
                workspace.context_numeric_counts(missing, events)
            changed = copy.deepcopy(events)
            changed[1]['fields']['scope'] = changed[0]['fields']['scope']
            with self.assertRaises(ValueError):
                workspace.context_numeric_counts(groups, changed)

    def test_duplicate_terminal_native_owner_or_missing_observer_is_refused(self):
        groups, values, events = self.fixture()
        with patch.object(workspace.counts, 'decode', side_effect=lambda group: values[workspace.counts.identity(group)]):
            for value in values.values():
                value['native']['owner_id'] = 11
            with self.assertRaises(ValueError):
                workspace.context_numeric_counts(groups, events)
        groups, values, events = self.fixture()
        for value in values.values():
            if value['operation_tag'] == 2:
                value['observer']['completion_available'] = False
        with patch.object(workspace.counts, 'decode', side_effect=lambda group: values[workspace.counts.identity(group)]):
            with self.assertRaises(ValueError):
                workspace.context_numeric_counts(groups, events)


if __name__ == '__main__':
    unittest.main()
