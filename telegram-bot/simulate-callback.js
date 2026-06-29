require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// Copy pasting the relevant parts from bot.js
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabaseUserId = process.env.SUPABASE_USER_ID;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const pendingData = new Map();
const fm = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Add custom error handler to see what's wrong
bot.catch((err) => console.error("GLOBAL ERROR:", err));

bot.action(/cat_(req_[0-9]+)_(.+)/, async (ctx) => {
  console.log("Action triggered!");
  const txId = ctx.match[1];
  const category = ctx.match[2];
  
  const pending = pendingData.get(txId);
  if (!pending) return ctx.answerCbQuery("❌ Sesi sudah diproses.", { show_alert: true });

  try {
    ctx.answerCbQuery("Menyimpan...").catch(e => console.error("answerCbQuery error:", e));
    await ctx.editMessageText(`⏳ Menyimpan ke database...`);
    console.log("Edited to saving...");

    let table = 'transactions';
    let payload = {};
    let undoPrefix = 'tx';

    if (pending.type === 'expense' || pending.type === 'income') {
      table = 'transactions';
      undoPrefix = 'tx';
      payload = { user_id: supabaseUserId, type: pending.type, amount: pending.amount, category: category, note: pending.note, date: new Date().toISOString() };
    }

    const { data, error } = await supabase.from(table).insert([payload]).select('id').single();
    if (error) throw error;
    
    console.log("Inserted to DB:", data);
    pendingData.delete(txId);

    let typeStr = '🔴 Pengeluaran';
    
    console.log("Attempting final editMessageText...");
    await ctx.editMessageText(
      `✅ *Berhasil dicatat!*\n\n${typeStr}: ${fm(pending.amount)}\nKategori: ${category}\nKeterangan: ${pending.note}`, 
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([ Markup.button.callback('❌ Batalkan (Undo)', `undo_${undoPrefix}_${data.id}`) ])
      }
    );
    console.log("Success!");
  } catch (error) {
    console.error("Caught error:", error);
    ctx.editMessageText(`❌ Terjadi kesalahan: ${error.message}`).catch(e => console.error("editMessageText error in catch:", e));
  }
});

async function simulate() {
  const txId = `req_12345`;
  pendingData.set(txId, { type: 'expense', amount: 25000, note: 'makan' });
  
  // Create a mock update for the callback query
  const mockUpdate = {
    update_id: 1,
    callback_query: {
      id: "mock_query_id",
      from: { id: parseInt(process.env.ALLOWED_TELEGRAM_USER_ID), is_bot: false, first_name: "User" },
      // To simulate editMessageText, we need a valid message in the callback query.
      // But we can't easily mock the Telegram API response for editMessageText without mocking the API server.
      // Wait, Telegraf makes real HTTP requests to the Telegram API.
      // If we use a fake message_id, Telegram will return "400 Bad Request: message to edit not found".
      // But we will see this error in the console!
      message: {
        message_id: 999999, // Fake message ID
        chat: { id: parseInt(process.env.ALLOWED_TELEGRAM_USER_ID), type: "private" },
        date: 1234567,
        text: "Draft message"
      },
      chat_instance: "123",
      data: `cat_${txId}_Food & Dining`
    }
  };

  console.log("Simulating handleUpdate...");
  await bot.handleUpdate(mockUpdate);
  console.log("Finished handleUpdate.");
}

simulate();
