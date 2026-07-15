import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const envUrlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const envKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : '';
const supabaseAnonKey = envKeyMatch ? envKeyMatch[1].trim() : '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFetch() {
  console.log('Testing DB connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('Fetch Error:', error);
    } else {
      console.log('Fetch Success:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testFetch();
