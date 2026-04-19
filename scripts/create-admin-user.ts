/**
 * Creates or updates a user account with admin role.
 * Usage: npx tsx scripts/create-admin-user.ts email@example.com [password]
 * If user already exists, just updates their role to admin.
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email) {
    console.error('Usage: npx tsx scripts/create-admin-user.ts email@example.com [password]');
    process.exit(1);
  }

  // Check if user exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find(u => u.email === email);

  if (found) {
    // Update role to admin
    const { error } = await supabase.auth.admin.updateUserById(found.id, {
      user_metadata: { ...found.user_metadata, role: 'admin' },
      email_confirm: true,
      ...(password ? { password } : {}),
    });
    if (error) throw error;
    console.log(`✅ Updated ${email} → role: admin${password ? ' + password' : ''}`);
  } else {
    if (!password) {
      console.error('New user requires a password: npx tsx scripts/create-admin-user.ts email password');
      process.exit(1);
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin' },
    });
    if (error) throw error;
    console.log(`✅ Created admin user: ${data.user.email}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
