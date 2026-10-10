"""Synthetic closed source-schema accounting/custody admission guards.

No Docker is invoked. Resource and runtime receipts are explicitly synthetic
protocol fixtures, never evidence of an actual case, Stop, mount or source stat.
The exported fixture's own stat is actual and is never relabeled source allocation.
"""
import importlib.util
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
import test_census as store_support
import test_closed_store as closed_support
from unittest.mock import patch

BENCH = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('overlay_oracle', BENCH / 'engine/oracle.py')
oracle = importlib.util.module_from_spec(spec)
spec.loader.exec_module(oracle)


class OverlayFixture:
    def __init__(self, home):
        self.home = home.resolve()
        self.path = self.home / 'overlay.sqlite'
        self.source, _, _, _ = oracle._overlay_storage_source()
        database = sqlite3.connect(self.path, isolation_level=None, timeout=0)
        database.execute('PRAGMA page_size=4096')
        database.execute('PRAGMA journal_mode=MEMORY')
        database.execute('PRAGMA synchronous=OFF')
        database.executescript(self.source)
        database.execute('PRAGMA foreign_keys=ON')
        self.owner = {'key': 'measured', 'namespace': 1, 'incarnation': '01' * 32}
        self.other = {'key': 'other', 'namespace': 2, 'incarnation': '02' * 32}
        for owner in (self.owner, self.other):
            database.execute('INSERT INTO workspace(ns,incarnation,base_root,active) VALUES(?,?,?,1)',
                             (owner['namespace'], bytes.fromhex(owner['incarnation']), bytes(32)))
        database.execute('INSERT INTO payload(ns,serial,gen,cell_offset,epoch,data,validity) VALUES(1,7,1,0,0,?,?)',
                         (bytes(8), b'\xff'))
        database.execute('INSERT INTO operation_record VALUES(1,1,0,0,?)', (b'abc',))
        database.execute('INSERT INTO native_mount VALUES(1,1,1,0)')
        database.execute('INSERT INTO payload(ns,serial,gen,cell_offset,epoch,data) VALUES(2,7,1,0,0,?)', (bytes(4096),))
        database.close()
        self.events = self.home / 'runtime.events.jsonl'
        self.export = self.home / 'export.completion.json'
        self.container = 'a' * 64
        self.volume = 'layerfs-fsb-sample-synthetic-only'
        self.write_events([
            {'event': 'sandbox_create_attempt', 'sequence': 1, 'value': 'volume=' + self.volume},
            {'event': 'daemon_setup', 'sequence': 2, 'fields': {'container': self.container}},
            {'event': 'mount', 'sequence': 3, 'fields': {'key': self.owner['key'], 'workspace_incarnation': self.owner['incarnation'],
                         'workspace_namespace': self.owner['namespace']}},
            {'event': 'container_stopped', 'sequence': 4, 'value': self.container},
            {'event': 'finished', 'sequence': 5}])
        self.export.write_text(json.dumps({'status': 'PASS', 'exit_code': 0, 'attempts': 1,
            'argv': ['docker', '--host', 'unix:///synthetic-only.sock', 'cp',
                     self.container + ':/layerfs-local/overlay/overlay.sqlite', str(self.path)]}))
        self.custody = dict(custody='KNOWN_STOP', container=self.container, volume=self.volume,
                            remote_source='/layerfs-local/overlay/overlay.sqlite', local_source=str(self.path),
                            runtime_events=str(self.events), export_completion=str(self.export))
        self.rebind()

    def rebind(self):
        self.custody.update(source_sha256=oracle.file_sha(self.path), source_size=self.path.stat().st_size,
                            runtime_events_sha256=oracle.file_sha(self.events), export_completion_sha256=oracle.file_sha(self.export))

    def write_events(self, events):
        self.events.write_text(''.join(json.dumps(event) + '\n' for event in events))

    def mutate(self, sql, params=()):
        with oracle.closing(sqlite3.connect(self.path, isolation_level=None, timeout=0)) as database:
            database.execute('PRAGMA journal_mode=MEMORY')
            database.execute('PRAGMA synchronous=OFF')
            database.execute(sql, params)
        self.rebind()

    def gone(self):
        with oracle.closing(sqlite3.connect(self.path, isolation_level=None, timeout=0)) as database:
            database.execute('PRAGMA journal_mode=MEMORY')
            database.execute('PRAGMA synchronous=OFF')
            _, _, tables, _ = oracle._overlay_storage_source()
            # Explicit synthetic terminal state, not execution of product cleanup.
            for table in tables:
                if table not in ('workspace', 'accounting', 'sqlite_sequence'):
                    database.execute(f'DELETE FROM "{table}" WHERE ns=1')
            database.execute('DELETE FROM workspace WHERE ns=1')
        self.rebind()

    def run(self):
        return oracle.observe_closed_storage(self.path, self.custody, kind='overlay', owners=[self.owner])


class ClosedOverlayStorage(unittest.TestCase):
    def test_live_exact_logical_accounting_does_not_credit_physical_equation(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            before = fixture.path.read_bytes()
            result = fixture.run()
            owner = result['owners'][0]
            self.assertEqual(owner['stored_payload_and_validity_bytes'], 9)
            self.assertEqual(owner['stored_operation_record_bytes'], 3)
            self.assertEqual(owner['row_counts']['native_mount'], 1)
            self.assertEqual(owner['maintained_accounting']['owner_details'], 1)
            self.assertEqual(owner['state'], 'LIVE')
            self.assertEqual(result['namespace_cleanup_status'], 'FAIL')
            self.assertEqual(result['observation_status'], 'PASS')
            for key in ('legacy_physical_equation_status', 'legacy_physical_resource_status',
                        'owned_spool_2gib_status', 'owned_files_after_cleanup_status', 'source_main_store_4gib_status'):
                self.assertEqual(result[key], 'UNAVAILABLE')
            self.assertEqual(result['export_copy']['export_allocated_bytes'], fixture.path.stat().st_blocks * 512)
            self.assertEqual(fixture.path.read_bytes(), before)
            self.assertNotIn('workspace_physical_allocated_bytes', owner)
            self.assertEqual(result['original_limits_bytes'], {'main_store': 4 * 1024**3, 'owned_spool': 2 * 1024**3})

    def test_gone_all_owned_rows_zero_with_other_workspace_and_shared_file_retained(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp)); fixture.gone()
            result = fixture.run()
            self.assertEqual(result['owners'][0]['state'], 'GONE')
            self.assertEqual(result['owners'][0]['owned_namespace_rows'], 0)
            self.assertEqual(result['namespace_cleanup_status'], 'PASS')
            self.assertGreater(result['export_copy']['size'], 0)
            self.assertEqual(result['owned_files_after_cleanup_status'], 'UNAVAILABLE')
            with oracle.closing(sqlite3.connect(fixture.path)) as database:
                self.assertEqual(database.execute('SELECT count(*) FROM workspace WHERE ns=2').fetchone(), (1,))

    def test_accounting_drift_and_residual_owned_row_cannot_hide_behind_gone(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            fixture.mutate('UPDATE accounting SET payload_bytes=0 WHERE ns=1')
            with self.assertRaisesRegex(ValueError, 'maintained namespace accounting'):
                fixture.run()
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp)); fixture.gone()
            fixture.mutate('INSERT INTO lease VALUES(1,1,1,0)')
            with self.assertRaisesRegex(ValueError, 'foreign key'):
                fixture.run()

    def test_exact_incarnation_domain_and_owner_membership_are_required(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            for owner in ({**fixture.owner, 'incarnation': 'ff' * 32}, {**fixture.owner, 'namespace': 3},
                          {**fixture.owner, 'namespace': True}, {**fixture.owner, 'incarnation': '00' * 32}, 'invalid-owner'):
                with self.subTest(owner=owner), self.assertRaises(ValueError):
                    oracle._observe_closed_storage_read_only(fixture.path, 'overlay', [owner])
            with self.assertRaisesRegex(ValueError, 'unique explicit'):
                oracle._observe_closed_storage_read_only(fixture.path, 'overlay', [])
            with self.assertRaisesRegex(ValueError, 'unique explicit'):
                oracle._observe_closed_storage_read_only(fixture.path, 'overlay', [fixture.owner, fixture.owner])

    def test_canonical_schema_trigger_membership_version_and_source_pins(self):
        for sql in ('CREATE TABLE extra(ns INTEGER)', 'DROP TRIGGER payload_account_insert', 'PRAGMA user_version=31'):
            with self.subTest(sql=sql), tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
                fixture = OverlayFixture(Path(temp)); fixture.mutate(sql)
                with self.assertRaisesRegex(ValueError, 'schema'):
                    fixture.run()
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            actual_sha = oracle.file_sha
            with patch.object(oracle, 'file_sha', side_effect=lambda path: 'bad' if str(path).endswith('/sql/accounting.sql') else actual_sha(path)):
                with self.assertRaisesRegex(ValueError, 'source pin'):
                    fixture.run()

    def test_knownstop_export_hash_command_and_explicit_mount_token_guards(self):
        for change in ('not_stopped', 'wrong_mount', 'missing_mount_numeric', 'wrong_sequence', 'wrong_export', 'wrong_hash'):
            with self.subTest(change=change), tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
                fixture = OverlayFixture(Path(temp))
                events = [json.loads(line) for line in fixture.events.read_text().splitlines()]
                if change == 'not_stopped': events[3]['event'] = 'attempted_stop'
                if change == 'wrong_mount': events[2]['fields']['workspace_incarnation'] = 'ff' * 32
                if change == 'missing_mount_numeric': del events[2]['fields']['workspace_namespace']
                if change == 'wrong_sequence': events[3]['sequence'] = 3
                fixture.write_events(events)
                if change == 'wrong_export':
                    command = json.loads(fixture.export.read_text()); command['argv'][4] = fixture.container + ':/wrong/file'
                    fixture.export.write_text(json.dumps(command))
                fixture.rebind()
                if change == 'wrong_hash': fixture.custody['source_sha256'] = '00' * 32
                with self.assertRaises(ValueError): fixture.run()

    def test_sidecars_hardlinks_and_change_during_read_are_refused(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            Path(str(fixture.path) + '-journal').touch()
            with self.assertRaisesRegex(ValueError, 'sidecar'): fixture.run()
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            (Path(temp) / 'hardlink').hardlink_to(fixture.path)
            with self.assertRaisesRegex(ValueError, 'one regular copy'): fixture.run()
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            observe = oracle._overlay_owner_accounting
            def mutate_after_observation(*args):
                result = observe(*args)
                with fixture.path.open('ab') as stream: stream.write(b'changed')
                return result
            with patch.object(oracle, '_overlay_owner_accounting', side_effect=mutate_after_observation):
                with self.assertRaisesRegex(ValueError, 'changed'): fixture.run()

    def test_actual_current_store_schema_and_source_stat_guard_have_distinct_scopes(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = store_support.StoreFixture(Path(temp))
            result = oracle.observe_closed_storage(fixture.path, fixture.custody, kind='store')
            self.assertEqual(result['schema_version'], 1)
            self.assertEqual(result['source_main_store_4gib_status'], 'UNAVAILABLE')
            self.assertEqual(result['namespace_cleanup_status'], 'UNAVAILABLE')
            stdout, completion = Path(temp) / 'source-stat.stdout', Path(temp) / 'source-stat.completion.json'
            row = {'schema': 'fs-bench-pro-source-storage-stat-v1', 'path': '/layerfs-store/global/store.sqlite',
                   'logical_bytes': fixture.path.stat().st_size, 'allocated_bytes': 4 * 1024**3 + 512,
                   'device': 1, 'inode': 2, 'links': 1}
            stdout.write_text(json.dumps(row))
            command = {'status': 'PASS', 'exit_code': 0, 'attempts': 1, 'stdout': str(stdout),
                       'argv': ['docker', '--host', 'unix:///synthetic-only.sock', 'exec', '--user', '0:0',
                                fixture.container, 'python3', '-B', '-c', oracle.storage_source_stat_body('store')]}
            completion.write_text(json.dumps(command))
            def bind():
                fixture.custody['source_stat'] = {'completion': str(completion), 'completion_sha256': oracle.file_sha(completion),
                                                 'stdout': str(stdout), 'stdout_sha256': oracle.file_sha(stdout)}
            bind()
            result = oracle.observe_closed_storage(fixture.path, fixture.custody, kind='store')
            self.assertEqual(result['source_main_store_4gib_status'], 'FAIL')
            self.assertNotEqual(result['source_stat']['allocated_bytes'], result['export_copy']['export_allocated_bytes'])
            row['allocated_bytes'] = 4 * 1024**3
            stdout.write_text(json.dumps(row)); bind()
            self.assertEqual(oracle.observe_closed_storage(fixture.path, fixture.custody, kind='store')['source_main_store_4gib_status'], 'PASS')
            command['argv'][-1] += '# changed observer'
            completion.write_text(json.dumps(command)); bind()
            with self.assertRaisesRegex(ValueError, 'exact acknowledged command'):
                oracle.observe_closed_storage(fixture.path, fixture.custody, kind='store')

    def test_normalized_wal_store_observation_binds_full_raw_set_without_modifying_it(self):
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            home = Path(temp).resolve()
            fixture = closed_support.WalFixture(home)
            normalized = fixture.normalize(home)
            custody = dict(fixture.fixture.custody)
            custody['normalization'] = {'receipt': normalized['receipt'], 'receipt_sha256': normalized['receipt_sha256']}
            result = oracle.observe_closed_storage(normalized['path'], custody, kind='store')
            self.assertEqual(result['observation_status'], 'PASS')
            self.assertEqual(result['normalization'], custody['normalization'])
            self.assertEqual(fixture.identities(), fixture.before)
            self.assertEqual(result['export_copy']['sha256'], normalized['normalized_identity']['sha256'])
            self.assertEqual(result['source_main_store_4gib_status'], 'UNAVAILABLE')
            with (fixture.raw / 'store.sqlite-wal').open('ab') as stream:
                stream.write(b'changed raw WAL')
            with self.assertRaisesRegex(ValueError, 'raw SQLite set changed'):
                oracle.observe_closed_storage(normalized['path'], custody, kind='store')

    def test_source_stat_binding_preserves_original_main_store_limit_and_copy_distinction(self):
        # Synthetic Store-stat receipt tests exercise admission/threshold arithmetic,
        # not actual source telemetry. The public path always authenticates this
        # separately from the exported copy's physical observation.
        with tempfile.TemporaryDirectory(prefix='fsb-overlay-test-') as temp:
            fixture = OverlayFixture(Path(temp))
            stdout, completion = Path(temp) / 'stat.stdout', Path(temp) / 'stat.completion.json'
            body = oracle.storage_source_stat_body('store')
            row = {'schema': 'fs-bench-pro-source-storage-stat-v1', 'path': '/layerfs-store/global/store.sqlite',
                   'logical_bytes': 1024, 'allocated_bytes': 4 * 1024**3 + 512, 'device': 1, 'inode': 2, 'links': 1}
            stdout.write_text(json.dumps(row))
            completion.write_text(json.dumps({'status': 'PASS', 'exit_code': 0, 'attempts': 1, 'stdout': str(stdout),
                'argv': ['docker', '--host', 'unix:///synthetic-only.sock', 'exec', '--user', '0:0',
                         fixture.container, 'python3', '-B', '-c', body]}))
            fixture.custody['source_stat'] = {'completion': str(completion), 'completion_sha256': oracle.file_sha(completion),
                                             'stdout': str(stdout), 'stdout_sha256': oracle.file_sha(stdout)}
            result = oracle._storage_source_stat(fixture.custody, 'store')
            self.assertEqual(result['allocated_bytes'], row['allocated_bytes'])
            self.assertNotEqual(result['allocated_bytes'], fixture.path.stat().st_blocks * 512)
            stdout.write_text('{}')
            with self.assertRaisesRegex(ValueError, 'hash'): oracle._storage_source_stat(fixture.custody, 'store')


if __name__ == '__main__':
    unittest.main()
