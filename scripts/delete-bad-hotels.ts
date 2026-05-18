/**
 * delete-bad-hotels.ts
 *
 * Deletes all REMOVE + REVIEW records identified by the hotel audit.
 * Generated from scripts/data/hotel-audit.json (2026-05-18).
 * Safe to re-run — deleting non-existent IDs is a no-op.
 *
 * Usage:
 *   npx tsx scripts/delete-bad-hotels.ts --dry-run
 *   npx tsx scripts/delete-bad-hotels.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';

const BAD_IDS = [
  // REMOVE — canoe shelters
  'ad1ea39f-6d33-4a4e-a4d5-7f9545a450bc', // Coffee Bay Day Use Canoe Shelter
  '90bcde83-fd38-4779-96d3-3883b4325077', // Mixon's Hammock Canoe Shelter
  // REVIEW — campgrounds, RV parks, marinas, fish camps
  'd91940dd-fdd5-4f59-bbd1-4de3ae732687',
  '0500ecb4-dc7e-4d22-b9d4-6120595e04c7',
  'b09c11fa-41cb-4879-a3fb-680840992606',
  'd61501dd-8444-4d1c-9719-d6df7d17f44a',
  'b8047e1a-5d98-45d2-8dd6-da8c69cbfefd',
  'd59f2027-8998-4eca-a6a8-26a15ada5b53',
  'daf05da0-0692-4247-9ca0-b2b3034b26d1',
  'd4cf7187-723a-47ca-a918-68ea9e9656b8',
  '1fbbcc26-9138-4777-be2f-b587381a6991',
  'e2e1f718-2c36-429e-8043-12bdfaf5e914',
  'c8401292-dcfc-4409-8ec3-c11bc7f609d4',
  'b686e389-cd79-403e-aa7f-39b24bef9166',
  'bb08e136-90d4-4a25-91ba-6ca33a22b860',
  'a167067b-664d-49f2-9f76-1d6ff1f041ba',
  'fcaab72d-05de-4ecb-b489-f9fa9bc7202e',
  '5a01f3f0-6cf8-4134-9879-e8d2c5984da2',
  '6ff467a6-37cc-4149-a9df-9ce69f9e9205',
  '3f2ca254-8eb0-4ec5-9781-8d3292385640',
  '761f2820-b993-44c9-bfa1-69e31c214672',
  'd186ca72-9c39-4746-84b1-947575255983',
  'ba23dfb6-d32f-44b5-a54a-c67fcbdba8bb',
  'f14ade0d-eccf-4fad-91bc-e1af26b9b1e3',
  '4d5b48c8-a771-4cac-a3d2-e6df902346d3',
  'c925e6bc-e98b-471f-a7a6-15a91323c4fd',
  'ca12677b-f656-463f-a7f1-4f6924e9b690',
  'd1b73b95-b414-4a9c-b29d-c2a8334dbe75',
  '6cc2a49f-d2ab-43a8-9019-02e2f42b1874',
  'f48eda06-faa3-4886-8388-7ee3c68ccd4b',
  '63ad47a3-acf2-4700-84fd-74efa2251b0d',
  '4314927b-ee40-4a46-a9b9-dff4dc229cfb',
  '9a356f85-8c39-46ee-a691-ec9918cef19e',
  '5c5ea3f8-f047-4e19-b7ab-b52147a18461',
  'd6b0c293-f26a-4253-ad9d-b7b127784208',
  'cc97c92c-61b7-4017-a2ca-8d54a1466cbc',
  'dcaf7cbb-3a9c-4ff1-93bb-b9984b42dcd4',
  '93ba7b23-dea4-4c68-b59f-2282c7e1fe90',
  '8f5eb051-2ca2-4f9d-8b1a-42dd23bbbad9',
  '487407fb-c631-4ed0-96ed-baf41230fbdf',
  '6f537720-d4b6-49fc-877f-872b6ce0e294',
  'b82c94f0-71c2-4013-a5ef-9c2481522fd5',
  '0710f355-eba1-4e24-a27c-51ecba2fdcb5',
  '0e99da0e-e2ed-4ef8-bbc4-dd7206f3211f',
  '9d410737-69b9-4772-acaa-fb21269a73c0',
  '89e6b340-9e3f-4b79-a783-29561d1f7719',
  'dd482029-2b1d-4d60-ae9f-44a2be59faee',
  '934fb190-2b3e-4731-be0e-900faf130a5f',
  '6f226ff9-3df7-4e8d-8b66-08aa96eff843',
  'ed55ffce-cf47-417a-ba0b-cca08919a5d8',
  '46889fb5-9f37-47b1-9596-e0be5fdb5ea7',
  '553b595c-cbaf-4090-8dd5-834302d58ccd',
  'cc71f196-1d40-477b-b371-47256ff77786',
  '3fd21c6e-8e36-48cb-ae6e-05a6c4934837',
  'c7b8424d-26a1-4146-adf4-3a204bb7becf',
  '83894f39-d5c7-477e-b539-b4a2d1cb2f0c',
  'c88f687e-4e50-4b4a-9834-9d19bd99ba78',
  '3a279855-5363-4a5d-bc6c-10c9187e72d0',
  '5b46233d-7887-438e-8130-b6607da143ec',
  'a2e6eb39-3347-42b4-86aa-b636044b8cce',
  '14f6eaec-6f68-46fb-af97-5ac03e66d1ca',
  '7a1df799-e8ba-4707-b89e-0dc397154860',
  'bc5e00e9-75b7-4468-9d0d-7ba9d78de4ce',
  '6c483614-34e6-40ed-a58c-fc794b3cd241',
  '3456fd07-ed48-483a-81eb-178a149cdc4e',
  'fe0f4077-dbe8-4277-818b-388d39d631a2',
  'a5386a3f-b9a7-42cd-86c6-aeb868fdf350',
  '14c88adc-0899-481b-bfce-608d7b4789af',
  '9dea34e2-5384-4154-a7f8-c3540e069d32',
  '09a353c7-b271-454f-8a5e-26629eea2ea9',
  'e0540e17-f6a9-41fb-8c16-1fa9d2ebd835',
  'd4d2da70-08d4-422f-9030-8b666451e08c',
  '83cd5534-4085-443d-a315-7efb4ca5e570',
  'edf4248e-571f-4a54-ac4b-b445a9107221',
  'b2b0b67e-5f6a-4a18-be0f-97c6df726973',
  '04049b0e-bef3-4c22-b39e-94ed782fc7ff',
  'a8e90dda-26ae-4c45-8dc8-ec0280936c06',
  '243c2cf8-6f2c-49f5-8633-fe4d0ddadaac',
  '40165ee1-0e67-4001-b055-1d134e7d6c23',
  'a9784f59-4b44-40ce-b43d-d3ce567e3ab5',
  'bce1b838-5f15-424c-ac33-af7c926e8de8',
  'c10a9887-cce0-45ef-bd38-d4ce23462107',
  '5b88d952-1bb4-429b-8275-d59aa66c7e91',
  'd1875992-9dbc-40ab-a6b7-3f40fb4dccc3',
  '756e6002-78f5-4e99-8a0b-087cfefa0ead',
  'f9e0c7ad-acb5-40d9-a316-9c0845247b73',
  '496887b3-17f0-415a-ab0e-32da2a15d49b',
  '7430c693-1605-42b5-a4e4-bedabc1b4b5b',
  'e876b6c7-e67e-4f66-a8b2-6da03f864a53',
  '042b4e29-d2bc-427e-bacf-665ff423a91f',
  '3a42a181-a146-4415-af6f-2313dc1a9386',
  '6d32bb27-3373-41bc-a481-9022199c9480',
  '7f920920-9b97-4c11-8f68-b66a63bdbf28',
  'cf6f7f29-f206-4596-9976-f3b81517c8bb',
  'c2670e3f-1a05-4d1b-b4a5-558c6ccfaec2',
  '5e394936-90e0-4250-8324-be2f6d4eb601',
  '7c5a1975-56aa-474b-b265-39a26a6ce752',
  '6c943e06-3f3c-4bbf-aaf2-55e944fdad6b',
  '594c621f-cdac-4940-ae46-c94f3724842f',
  'ff69a07d-8d56-4549-acb2-004431cae906',
  'd359fcb0-1cc1-4155-88af-6c0b916f2db5',
  '50aa4446-2fe3-4f50-a6a2-291a06f8686d',
  'ff5ccc85-9854-4920-ae9b-00e1e04f2f1a',
  '35ce0e36-d63a-4d61-9c1a-ea13ee86425f',
  '930a0008-7d07-45f4-87b3-36354da7a6d1',
  '4a1dc89b-8df0-4a43-82c5-49925b80787a',
  '51bbdb2b-ad1b-4528-b46a-007d560e75b7',
];

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log(`\nDeleting ${BAD_IDS.length} bad hotel records${dryRun ? ' (DRY RUN)' : ''}...\n`);

  if (dryRun) {
    console.log(`Would delete ${BAD_IDS.length} records.`);
    return;
  }

  const { error, count } = await supabaseAdmin
    .from('park_hotels')
    .delete({ count: 'exact' })
    .in('id', BAD_IDS);

  if (error) throw new Error(`Delete failed: ${error.message}`);
  console.log(`✅ Deleted ${count} records.`);

  const { count: remaining } = await supabaseAdmin
    .from('park_hotels')
    .select('*', { count: 'exact', head: true });
  console.log(`   ${remaining} records remain.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
