require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY is missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Setup Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
  process.exit(1);
}

const bot = new Telegraf(token);

// 3. Security: Check if user is allowed
const allowedUserId = process.env.ALLOWED_TELEGRAM_USER_ID;
const supabaseUserId = process.env.SUPABASE_USER_ID;

// Middleware for access control
bot.use((ctx, next) => {
  const userId = ctx.from?.id?.toString();
  
  if (ctx.message && ctx.message.text === '/start') {
    return next(); // Let /start pass to show their ID
  }

  if (!allowedUserId || allowedUserId === "") {
    ctx.reply(`⚠️ SECURITY ALERT: ALLOWED_TELEGRAM_USER_ID is not set in your .env file.\n\nYour Telegram User ID is: ${userId}\n\nPlease add it to the .env file and restart the bot.`);
    return;
  }

  if (userId !== allowedUserId) {
    console.log(`Unauthorized access attempt by ID: ${userId}`);
    ctx.reply("❌ Unauthorized user. You are not allowed to use this bot.");
    return;
  }

  if (!supabaseUserId || supabaseUserId === "") {
    ctx.reply(`⚠️ SUPABASE_USER_ID is not set in your .env file. Please add your WealthPilot user ID to use the bot.`);
    return;
  }

  return next();
});

// 4. Command: /start
bot.start((ctx) => {
  const userId = ctx.from?.id;
  ctx.reply(`🤖 Welcome to WealthPilot Telegram Bot!\n\nYour Telegram User ID is: *${userId}*\n\nIf you haven't already, add this ID to your \`.env\` file as \`ALLOWED_TELEGRAM_USER_ID\`.\n\n*How to use:*\n- Type "keluar [jumlah] [keterangan]" for expenses.\n  Example: \`keluar 50000 makan siang\`\n- Type "masuk [jumlah] [keterangan]" for income.\n  Example: \`masuk 2000000 gaji bulanan\``, { parse_mode: 'Markdown' });
});

// 5. NLP Parser for transactions
bot.on('text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();
  
  // Basic Regex to match "keluar/masuk [amount] [note]"
  const expenseMatch = text.match(/^(keluar|bayar|pengeluaran)\s+([0-9.,]+)\s+(.+)$/i);
  const incomeMatch = text.match(/^(masuk|terima|pemasukan)\s+([0-9.,]+)\s+(.+)$/i);

  let type = null;
  let amountStr = null;
  let note = null;

  if (expenseMatch) {
    type = 'expense';
    amountStr = expenseMatch[2];
    note = expenseMatch[3];
  } else if (incomeMatch) {
    type = 'income';
    amountStr = incomeMatch[2];
    note = incomeMatch[3];
  } else {
    return ctx.reply("❌ Format tidak dikenali.\n\nGunakan format:\n`keluar 50000 makan siang`\n`masuk 2000000 gaji bulanan`", { parse_mode: 'Markdown' });
  }

  // Parse amount (handle dots or commas)
  const amount = Number(amountStr.replace(/[^0-9]/g, ''));

  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Jumlah tidak valid. Harap masukkan angka yang benar.");
  }

  // Extract a rough category from the note (first word)
  let category = note.split(' ')[0];
  category = category.charAt(0).toUpperCase() + category.slice(1);
  if (category.length < 3) category = "Lainnya";

  try {
    ctx.reply("⏳ Menyimpan ke WealthPilot...");

    // Insert into Supabase
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: supabaseUserId,
          type: type,
          amount: amount,
          category: category,
          note: note,
          method: 'Cash', // Default method for bot
          date: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    const typeStr = type === 'expense' ? '🔴 Pengeluaran' : '🟢 Pemasukan';
    const amountFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    
    ctx.reply(`✅ *Berhasil dicatat!*\n\n${typeStr}: ${amountFormatted}\nKategori: ${category}\nCatatan: ${note}`, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error("Error inserting transaction:", error);
    ctx.reply(`❌ Terjadi kesalahan saat menyimpan data: ${error.message}`);
  }
});

// 6. Start the bot
bot.launch().then(() => {
  console.log("🚀 WealthPilot Telegram Bot is running...");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
