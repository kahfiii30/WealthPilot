require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

module.exports = async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Missing Supabase credentials in .env" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Melakukan query ringan ke database untuk mencegah auto-pause
    const { data, error } = await supabase
      .from('telegram_accounts') // Atau tabel lain yang ada
      .select('user_id')
      .limit(1);

    if (error) throw error;

    console.log("Keep-alive ping successful!");
    return res.status(200).json({ success: true, message: "Database is active" });
  } catch (error) {
    console.error('Error in keep-alive ping:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
