import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env/.env.local if present so developers can keep creds in .env.local
function loadDotenv() {
  const envFiles = ['.env.local', '.env'];
  for (const f of envFiles) {
    const p = path.resolve(process.cwd(), f);
    if (!fs.existsSync(p)) continue;
    const content = fs.readFileSync(p, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
    break;
  }
}

loadDotenv();

function parseArgs() {
  const args = {};
  for (const a of process.argv.slice(2)) {
    const [k, v] = a.replace(/^--/, '').split('=');
    args[k] = v ?? true;
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const email = args.email || process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = args.password || process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const name = args.name || process.env.SEED_ADMIN_NAME || 'Administrator';
  const role = args.role || process.env.SEED_ADMIN_ROLE || 'admin';

  // Accept SUPABASE_* or NEXT_PUBLIC_* names to be flexible
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC equivalents) env vars.'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    console.log(`Creating admin user: ${email}`);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name },
      // set app_metadata if supported by the SDK
      app_metadata: { role },
      email_confirm: true,
    });

    if (error) {
      // If user exists or another issue, try to find user and update
      console.warn('Create user returned error:', error.message || error);

      // Try to list users and find by email
      try {
        const list = await supabase.auth.admin.listUsers();
        const found =
          list.data?.users?.find((u) => u.email === email) ||
          list.data?.find((u) => u.email === email);
        if (found) {
          console.log('User already exists. Updating user metadata and role.');
          await supabase.auth.admin.updateUserById(found.id, {
            user_metadata: { full_name: name },
            app_metadata: { role },
          });
          // attempt to upsert profile if table exists
          try {
            await supabase.from('profiles').upsert({ id: found.id, full_name: name, role });
          } catch (e) {
            // ignore if profiles table doesn't exist
          }
          console.log('Admin user updated.');
          process.exit(0);
        }
      } catch (listErr) {
        console.warn('Could not list users or find existing user:', listErr);
      }

      console.error('Failed to create admin user.');
      process.exit(1);
    }

    const user = data?.user ?? null;
    if (!user) {
      console.error('User creation returned no user object.');
      process.exit(1);
    }

    console.log('Admin user created:', user.id);

    // Try to upsert into profiles table if it exists
    try {
      await supabase.from('profiles').upsert({ id: user.id, full_name: name, role });
      console.log('Upserted profile record (if table exists).');
    } catch (e) {
      console.warn('Failed to upsert profile (maybe table does not exist):', e?.message ?? e);
    }

    console.log('Done. You can now log in with the admin account.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
