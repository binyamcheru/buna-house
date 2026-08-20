import { hashPassword } from '../lib/password';
import { supabaseAdmin } from '../lib/supabase';

/**
 * One-time migration script to hash existing plain text admin passwords
 * Run this once after deploying bcrypt changes
 * Usage: node scripts/hash-admin-passwords.js
 */

async function hashAdminPasswords() {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase not configured');
      process.exit(1);
    }

    console.log('🔄 Fetching admin users...');
    const { data: adminUsers, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, password_hash');

    if (error) {
      console.error('Error fetching admin users:', error);
      process.exit(1);
    }

    if (!adminUsers || adminUsers.length === 0) {
      console.log('No admin users found');
      process.exit(0);
    }

    console.log(`Found ${adminUsers.length} admin user(s)`);

    for (const user of adminUsers) {
      // Check if password is already hashed (bcrypt hashes start with $2a, $2b, or $2y)
      if (user.password_hash && (user.password_hash.startsWith('$2a') || user.password_hash.startsWith('$2b') || user.password_hash.startsWith('$2y'))) {
        console.log(`✓ ${user.email} - already hashed`);
        continue;
      }

      // Hash the plain text password
      console.log(`⏳ Hashing password for ${user.email}...`);
      const hashedPassword = await hashPassword(user.password_hash || 'admin123');

      // Update in database
      const { error: updateError } = await supabaseAdmin
        .from('admin_users')
        .update({ password_hash: hashedPassword })
        .eq('id', user.id);

      if (updateError) {
        console.error(`❌ Error hashing password for ${user.email}:`, updateError);
      } else {
        console.log(`✓ ${user.email} - password hashed successfully`);
      }
    }

    console.log('✅ Password hashing migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

hashAdminPasswords();
