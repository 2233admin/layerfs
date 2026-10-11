"""An original faulted closed sample is proof input, never a measured Init."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[2]))
from engine import fixtures,identity

class IntegrityInstallScope(unittest.TestCase):
    def test_exact_integrity_sample_has_truthful_purpose_without_another_init(self):
        for case in ("workspace-corrupt-descendant-compact-v2-proof","workspace-missing-descendant-compact-v2-proof"):
            with self.subTest(case=case),tempfile.TemporaryDirectory() as temporary:
                root=Path(temporary); store=root/'faulted.sqlite';store.write_bytes(b'exact faulted closed byte copy')
                manifest=root/'manifest';manifest.write_bytes(b'original public installed manifest')
                closed={'sealed_store':str(store),'store_sha256':identity.sha256(store),'manifest':str(manifest),'manifest_sha256':identity.sha256(manifest)}
                calls=[]
                def command(argv,folder,label,stop):
                    calls.append((argv,label,stop));stdout=folder/(label+'.stdout')
                    if label=='historical-master-volume': body=argv[-1]+'\n'
                    elif label=='historical-master-install': body='backing_directory=0:0:700\nbacking_store=0:0:600\n'+closed['store_sha256']+'  /dest/global/store.sqlite\n'
                    else: body=''
                    stdout.write_text(body);return {'stdout':str(stdout),'exit_code':0,'status':'PASS'}
                output=root/'install'
                with patch.object(fixtures.receipts,'command',side_effect=command):
                    volume,result=fixtures.install_closed_history_store(closed,{'source_uid':501,'source_gid':20},output,{'socket':'mocked'},sample=True,integrity_case=case)
                claim=json.loads((output/'resource-claim.json').read_text())
                self.assertTrue(volume.startswith('layerfs-fsb-sample-'))
                self.assertEqual(result['integrity_case'],case)
                self.assertIn('faulted closed',claim['purpose']);self.assertIn('faulted closed',result['scope'])
                self.assertIn('no measured Init',claim['purpose']);self.assertIn('no additional Init',result['scope'])
                self.assertNotIn('fresh measured Init',claim['purpose']);self.assertNotIn('freshly sealed measured Init',result['scope'])
                self.assertEqual(result['store_sha256'],closed['store_sha256']);self.assertEqual(result['manifest_sha256'],closed['manifest_sha256'])
                self.assertEqual(store.read_bytes(),(output/'store.sqlite').read_bytes())
                self.assertEqual(len([r for r in calls if r[1]=='historical-master-install']),1)
                self.assertFalse(any('provision' in argv for argv,_,_ in calls))

    def test_integrity_label_cannot_be_used_for_another_case_or_master(self):
        with tempfile.TemporaryDirectory() as temporary:
            for case,sample in [('workspace-lease-lifecycle-compact-v2-proof',True),('workspace-corrupt-descendant-compact-v2-proof',False)]:
                out=Path(temporary)/case
                with patch.object(fixtures.receipts,'command') as run,self.assertRaises(ValueError):
                    fixtures.install_closed_history_store({}, {},out,{},sample=sample,integrity_case=case)
                self.assertFalse(out.exists());run.assert_not_called()

if __name__=='__main__':unittest.main()
