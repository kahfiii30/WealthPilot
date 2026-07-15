require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log("Mengambil daftar user dari Supabase...");
  const { data, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Gagal mengambil data user:", error);
    return;
  }
  
  if (data.users && data.users.length > 0) {
    console.log(`Ditemukan ${data.users.length} user terdaftar:\n`);
    data.users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} (Dibuat: ${new Date(user.created_at).toLocaleString()})`);
    });
  } else {
    console.log("Tidak ada user terdaftar di sistem (0 users).");
  }
}

checkUsers();
