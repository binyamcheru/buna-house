const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🔵 Running categories table migration...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'supabase-migrations', '003_categories_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Try direct approach if RPC fails
        console.log(`   Trying direct execution...`);
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ query: statement })
        });

        if (!response.ok) {
          throw new Error(`Failed to execute: ${statement.substring(0, 100)}...`);
        }
      }

      console.log(`   ✅ Success\n`);
    }

    // Verify the table was created
    console.log('🔍 Verifying categories table...');
    const { data: categories, error: verifyError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order');

    if (verifyError) {
      throw verifyError;
    }

    console.log(`✅ Migration successful! Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   ${cat.display_order}. ${cat.name} (${cat.slug}) - ${cat.is_active ? 'Active' : 'Hidden'}`);
    });

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.log('\n📝 Manual steps:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Open SQL Editor');
    console.log('   3. Copy and paste the contents of supabase-migrations/003_categories_table.sql');
    console.log('   4. Run the query');
    process.exit(1);
  }
}

runMigration();
