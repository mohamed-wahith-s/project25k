/**
 * Step 2: Populate dept_count after column has been added.
 * 
 * Before running this, execute in Supabase SQL Editor:
 *   ALTER TABLE colleges ADD COLUMN IF NOT EXISTS dept_count integer DEFAULT 0;
 */
const { supabase } = require('../db');

async function populate() {
  console.log('Fetching all cutoff_data rows in pages...');

  const PAGE = 5000;
  let from = 0;
  let allRows = [];
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('cutoff_data')
      .select('college_code, dept_id')
      .range(from, from + PAGE - 1);

    if (error) {
      console.error('Error:', error.message);
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

  console.log(`\nTotal rows: ${allRows.length}`);

  // Build countMap
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

  // Update each college
  console.log('Updating...');
  let updated = 0, failed = 0;

  for (const { code, count } of entries) {
    const { error } = await supabase
      .from('colleges')
      .update({ dept_count: count })
      .eq('college_code', code);

    if (error) {
      console.error(`\n  Failed for ${code}: ${error.message}`);
      if (error.message.includes('does not exist') || error.message.includes('schema cache')) {
        console.log('\n⚠️  Column does not exist! Run this in Supabase SQL Editor first:\n');
        console.log('  ALTER TABLE colleges ADD COLUMN IF NOT EXISTS dept_count integer DEFAULT 0;\n');
        process.exit(1);
      }
      failed++;
    } else {
      updated++;
      if (updated % 20 === 0) process.stdout.write(`\r  Updated ${updated}/${entries.length}...`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);

  // Verify
  const { data: sample } = await supabase
    .from('colleges')
    .select('college_code, college_name, dept_count')
    .gt('dept_count', 0)
    .limit(5);

  console.log('\nVerification:');
  sample?.forEach(c => console.log(`  ${c.college_name} (${c.college_code}): ${c.dept_count} depts`));
}

populate().catch(err => { console.error(err); process.exit(1); });
