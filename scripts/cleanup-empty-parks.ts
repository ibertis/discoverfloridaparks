import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
import { supabaseAdmin } from './lib/supabase-admin.js';

async function main() {
  // Find parks with empty/null name or slug
  const { data: bad, error } = await supabaseAdmin
    .from('parks')
    .select('id, slug, name')
    .or('name.is.null,name.eq.,slug.is.null,slug.eq.');

  if (error) throw error;
  console.log(`Found ${bad?.length ?? 0} parks with empty name or slug.`);
  if (bad?.length) console.log(JSON.stringify(bad.slice(0, 20), null, 2));

  if (!bad?.length) return;

  const ids = bad.map(r => r.id);
  const { error: delError } = await supabaseAdmin
    .from('parks')
    .delete()
    .in('id', ids);

  if (delError) throw delError;
  console.log(`✅ Deleted ${ids.length} empty park rows.`);
}

main().catch(e => { console.error(e); process.exit(1); });
