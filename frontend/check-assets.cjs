require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('assets').select('*');
  if (error) console.error(error);
  console.log("Total assets in DB:", data?.length);
  if (data?.length) {
    console.log("Assets:", data.map(a => ({ name: a.name, user: a.user_id })));
  }
}
check();
