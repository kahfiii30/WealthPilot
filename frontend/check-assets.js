import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qbikfzahtqdvlftnlbre.supabase.co';
const supabaseKey = 'sb_publishable_0SnmEMmsTEzau9TjJluN1A_Y7CqyjLC';
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
