const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUserId = process.env.SUPABASE_USER_ID;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Starting test insert...");
  const payload = {
    user_id: supabaseUserId,
    type: 'expense',
    amount: 25000,
    category: 'Food & Dining',
    note: 'makan',
    date: new Date().toISOString()
  };

  const { data, error } = await supabase.from('transactions').insert([payload]).select('id').single();
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success:", data);
  }
}

testInsert();
