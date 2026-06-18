import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...values] = line.split('=');
            if (key) process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
} catch (e) { }

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkColumn() {
    console.log('🔍 Checking if implementing_agency_id exists in fund_releases...');
    const { data, error } = await supabase
        .from('fund_releases')
        .select('implementing_agency_id')
        .limit(1);

    if (error) {
        console.error('❌ Error (Column likely missing):');
        console.error(JSON.stringify(error, null, 2));
    } else {
        console.log('✅ Column exists! (It might be a cache issue if API still fails)');
        console.log(data);
    }
}

checkColumn();
