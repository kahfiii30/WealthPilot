import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const envUrlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const envKeyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = envUrlMatch ? envUrlMatch[1].trim() : '';
const supabaseAnonKey = envKeyMatch ? envKeyMatch[1].trim() : '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const email = 'kulbetfiii@gmail.com';
  const password = 'Biharaga2005.';

  console.log('Testing login for:', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Login Error:', error.message);
  } else {
    console.log('Login Success! User ID:', data.user.id);
  }
}

testLogin();
