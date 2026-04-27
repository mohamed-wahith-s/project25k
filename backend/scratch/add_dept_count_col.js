/**
 * Step 1: Add dept_count column and populate it.
 * 
 * Since Supabase JS client can't run DDL directly, this script:
 * 1. Uses the Supabase Management API to run SQL (requires SERVICE_ROLE_KEY)
 * 2. Falls back to manual instructions if that fails
 */
const { supabase } = require('../db');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

async function addColumnAndPopulate() {
  // ── STEP 1: Try adding the column via raw HTTP ────────────────────────────
  console.log('Attempting to add dept_count column...');
  
  // Extract the project ref from the URL
  const projectRef = SUPABASE_URL?.replace('https://', '').split('.')[0];
  
  if (projectRef && SERVICE_ROLE_KEY) {
    try {
      const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `ALTER TABLE colleges ADD COLUMN IF NOT EXISTS dept_count integer DEFAULT 0;`
        })
      });
      const result = await resp.json();
      console.log('Add column result:', result);
    } catch (err) {
      console.log('Management API attempt failed:', err.message);
    }
  }

  // ── STEP 2: Populate dept_count from cutoff_data ─────────────────────────
  console.log('\nFetching all cutoff_data rows (this may take a moment)...');

  const PAGE = 10000;
  let from = 0;
  let allRows = [];
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('cutoff_data')
      .select('college_code, dept_id')
      .range(from, from + PAGE - 1);

    if (error) {
      console.error('Error fetching cutoff_data:', error.message);
      process.exit(1);
    }

    allRows = allRows.concat(data);
    process.stdout.write(`\r  Fetched ${allRows.length} rows...`);

    if (data.length < PAGE) {
      hasMore = false;
    } else {
      from += PAGE;
    }
  }

  console.log(`\nTotal rows fetched: ${allRows.length}`);

  // Build countMap: college_code -> unique dept count
  const setMap = {};
  allRows.forEach(row => {
    const code = String(row.college_code);
    if (!setMap[code]) setMap[code] = new Set();
    setMap[code].add(row.dept_id);
  });

  const entries = Object.entries(setMap).map(([code, set]) => ({
    code,
    count: set.size
  }));

  console.log(`Found ${entries.length} colleges with departments.`);
  console.log('Top 5 samples:', entries.slice(0, 5));

  // ── STEP 3: Update each college ───────────────────────────────────────────
  console.log('\nUpdating colleges table...');
  let updated = 0, failed = 0;

  for (const { code, count } of entries) {
    const { error } = await supabase
      .from('colleges')
      .update({ dept_count: count })
      .eq('college_code', code);

    if (error) {
      // Column might not exist yet
      console.error(`\nFailed for ${code}: ${error.message}`);
      if (error.message.includes('does not exist')) {
        console.log('\n⚠️  The dept_count column does not exist yet.');
        console.log('Please run this SQL in your Supabase Dashboard → SQL Editor:\n');
        console.log('  ALTER TABLE colleges ADD COLUMN dept_count integer DEFAULT 0;\n');
        console.log('Then run this script again.');
        process.exit(1);
      }
      failed++;
    } else {
      updated++;
    }

    if (updated % 50 === 0) {
      process.stdout.write(`\r  Updated ${updated}/${entries.length}...`);
    }
  }

  console.log(`\n\nDone! Updated: ${updated}, Failed: ${failed}`);
  
  // Verify
  const { data: sample } = await supabase
    .from('colleges')
    .select('college_code, college_name, dept_count')
    .gt('dept_count', 0)
    .limit(5);
  
  console.log('\nVerification - Sample colleges with dept_count:');
  sample?.forEach(c => console.log(`  ${c.college_name} (${c.college_code}): ${c.dept_count}`));
}

addColumnAndPopulate().catch(err => {
  console.error(err);
  process.exit(1);
});
