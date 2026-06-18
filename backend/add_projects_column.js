const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addProjectsColumn() {
    console.log('🔄 Adding projects column...');

    console.log('⚠️ Please execute the following SQL in your Supabase SQL Editor:');
    console.log(`
    ALTER TABLE village_fund_releases 
    ADD COLUMN IF NOT EXISTS projects TEXT[] DEFAULT '{}';
    `);

    // Also ensuring component is TEXT[] unique if it wasn't
    console.log(`
    -- Ensure component is also an array if not already
    -- ALTER TABLE village_fund_releases ALTER COLUMN component TYPE TEXT[] USING component::TEXT[];
    `);
}

addProjectsColumn();
