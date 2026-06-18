import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from CURRENT directory
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
} catch (e) { console.error("Error reading .env", e); }

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function findAgency() {
    console.log('🔍 Searching for West Godavari Agency...');

    const { data, error } = await supabase
        .from('implementing_agencies')
        .select('*')
        .ilike('district_name', '%West Godavari%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data.length > 0) {
        console.log('✅ Found Agency:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('❌ No agency found for West Godavari.');

        // Debug: List all AP agencies
        const { data: all } = await supabase.from('implementing_agencies').select('district_name').eq('state_name', 'Andhra Pradesh');
        console.log('Available Districts:', all?.map(a => a.district_name));
    }
}

findAgency();
