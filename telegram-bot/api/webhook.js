require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Setup Telegram Bot
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("❌ TELEGRAM_BOT_TOKEN is missing in .env");
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: false }
});

// 3. Security: Check if user is allowed
const allowedUserId = process.env.ALLOWED_TELEGRAM_USER_ID;
const supabaseUserId = process.env.SUPABASE_USER_ID;

// Pending Transactions Memory Store
// Peringatan: Pada Serverless function (Vercel), memori ini bisa tereset jika function "cold start".
// Untuk produksi jangka panjang disarankan menyimpannya ke Supabase / Redis. 
// Namun untuk pemakaian pribadi yang cepat, ini biasanya masih berfungsi karena function tetap "warm" beberapa saat.
const pendingData = new Map();

// Formatter
const fm = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Middleware for access control
bot.use((ctx, next) => {
  const userId = ctx.from?.id?.toString();

  if (ctx.message && ctx.message.text === '/start') {
    return next();
  }

  if (!allowedUserId || allowedUserId === "") {
    ctx.reply(`⚠️ SECURITY ALERT: ALLOWED_TELEGRAM_USER_ID is not set in your .env file.\n\nYour Telegram User ID is: ${userId}`);
    return;
  }

  if (userId !== allowedUserId) {
    console.log(`Unauthorized access attempt by ID: ${userId}`);
    ctx.reply("❌ Unauthorized user.");
    return;
  }

  if (!supabaseUserId || supabaseUserId === "") {
    ctx.reply(`⚠️ SUPABASE_USER_ID is not set in your .env file.`);
    return;
  }

  return next();
});

// 4. Command: /start & Menu Dashboard
bot.start((ctx) => {
  const userId = ctx.from?.id;
  ctx.reply(`🤖 *Welcome to WealthPilot Pro!*\n\nYour ID: \`${userId}\`\n\nGunakan menu di bawah ini atau ketik cepat:\n\`masuk 50000 jajan\`\n\`hutang 500000 pinjol\`\n\`aset 2000000 reksadana\`\n\`piutang 50000 budi\``, {
    parse_mode: 'Markdown',
    ...Markup.keyboard([
      ['📊 Laporan & Portofolio', '➕ Cara Penggunaan'],
      ['⚙️ Pengaturan']
    ]).resize()
  });
});

bot.command('menu', (ctx) => {
  ctx.reply("Pilih menu navigasi:", Markup.keyboard([
    ['📊 Laporan & Portofolio', '➕ Cara Penggunaan'],
    ['⚙️ Pengaturan']
  ]).resize());
});

// Text Menu Handlers
bot.hears('📊 Laporan & Portofolio', (ctx) => handleReport(ctx));
bot.hears('➕ Cara Penggunaan', (ctx) => {
  ctx.reply("💡 *Cara Cepat Mencatat:*\n\n1. Pengeluaran: \`keluar 50000 makan\`\n2. Pemasukan: \`masuk 2000000 gaji\`\n3. Hutang: \`hutang 50000 pinjol\`\n4. Aset: \`aset 1000000 tabungan\`\n5. Piutang: \`piutang 50000 budi\`\n\nSetelah itu, bot akan memproses & menyimpan secara otomatis!", { parse_mode: 'Markdown' });
});
bot.hears('⚙️ Pengaturan', (ctx) => {
  ctx.reply("⚙️ *Pengaturan Koneksi*\nStatus: ✅ Terhubung ke Supabase\nFitur Premium: Aktif (Aset, Hutang, Piutang Tersinkronisasi)", { parse_mode: 'Markdown' });
});

bot.command('report', (ctx) => handleReport(ctx));

// Function to handle Monthly Report & Portfolio
async function handleReport(ctx) {
  try {
    ctx.reply("⏳ Menarik data portofolio dari Supabase...");

    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, d.getMonth() + 1, 0).getDate(); // Get last day of month
    const monthStr = `${year}-${month}`;

    const startDate = `${year}-${month}-01T00:00:00.000Z`;
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    // Fetch all required data in parallel
    const [txRes, assetRes, debtRes, recRes] = await Promise.all([
      supabase.from('transactions').select('amount, type').eq('user_id', supabaseUserId).gte('date', startDate).lte('date', endDate),
      supabase.from('assets').select('amount').eq('user_id', supabaseUserId),
      supabase.from('debts').select('amount').eq('user_id', supabaseUserId),
      supabase.from('receivables').select('amount, paid_amount').eq('user_id', supabaseUserId)
    ]);

    if (txRes.error) throw txRes.error;
    if (assetRes.error) throw assetRes.error;
    if (debtRes.error) throw debtRes.error;
    if (recRes.error) throw recRes.error;

    let income = 0;
    let expense = 0;
    txRes.data.forEach(t => {
      if (t.type === 'income') income += Number(t.amount);
      if (t.type === 'expense') expense += Number(t.amount);
    });

    let totalAssets = assetRes.data.reduce((acc, a) => acc + Number(a.amount), 0);
    let totalDebts = debtRes.data.reduce((acc, d) => acc + Number(d.amount), 0);

    let totalReceivables = recRes.data.reduce((acc, r) => acc + (Number(r.amount) - Number(r.paid_amount)), 0);

    const balance = income - expense;

    const reportMsg = `📊 *Laporan Bulan Ini (${monthStr})*\n\n` +
      `🟢 Pemasukan: ${fm(income)}\n🔴 Pengeluaran: ${fm(expense)}\n💰 Sisa Cashflow: ${fm(balance)}\n\n` +
      `🏦 *Portofolio Saat Ini:*\n` +
      `💎 Total Aset: ${fm(totalAssets)}\n` +
      `💳 Total Hutang: ${fm(totalDebts)}\n` +
      `🤝 Total Piutang: ${fm(totalReceivables)}\n\n` +
      `⚖️ *Net Worth Bersih:* ${fm(balance + totalAssets + totalReceivables - totalDebts)}`;

    ctx.reply(reportMsg, { parse_mode: 'Markdown' });
  } catch (err) {
    ctx.reply(`❌ Gagal mengambil laporan: ${err.message}`);
  }
}

// 5. NLP Parser
bot.on('text', async (ctx) => {
  const text = ctx.message.text.toLowerCase();

  if (text === '📊 laporan & portofolio' || text === '➕ cara penggunaan' || text === '⚙️ pengaturan') return;

  // Shortcut for checking balance
  if (text.includes('saldo') || text.includes('cek saldo') || text.includes('report')) {
    return handleReport(ctx);
  }

  const expenseMatch = text.match(/^(keluar|bayar|pengeluaran|min)\s+([0-9.,]+)\s+(.+)$/i);
  const incomeMatch = text.match(/^(masuk|terima|pemasukan|plus)\s+([0-9.,]+)\s+(.+)$/i);
  const assetMatch = text.match(/^(aset|asset|tambah aset)\s+([0-9.,]+)\s+(.+)$/i);
  const debtMatch = text.match(/^(hutang|utang)\s+([0-9.,]+)\s+(.+)$/i);
  const recMatch = text.match(/^(piutang|dipinjam|pinjamin)\s+([0-9.,]+)\s+(.+)$/i);

  let type = null;
  let amountStr = null;
  let note = null;

  if (expenseMatch) { type = 'expense'; amountStr = expenseMatch[2]; note = expenseMatch[3]; }
  else if (incomeMatch) { type = 'income'; amountStr = incomeMatch[2]; note = incomeMatch[3]; }
  else if (assetMatch) { type = 'asset'; amountStr = assetMatch[2]; note = assetMatch[3]; }
  else if (debtMatch) { type = 'debt'; amountStr = debtMatch[2]; note = debtMatch[3]; }
  else if (recMatch) { type = 'receivable'; amountStr = recMatch[2]; note = recMatch[3]; }
  else {
    return ctx.reply("❌ Format tidak dikenali.\n\nGunakan format:\n`keluar 50000 makan`\n`hutang 500000 pinjol`\n`aset 1000000 emas`", { parse_mode: 'Markdown' });
  }

  const amount = Number(amountStr.replace(/[^0-9]/g, ''));
  if (isNaN(amount) || amount <= 0) {
    return ctx.reply("❌ Jumlah tidak valid.");
  }

  // Handle Receivables directly (no category needed)
  if (type === 'receivable') {
    try {
      const msg = await ctx.reply("⏳ Menyimpan piutang...");
      const { data, error } = await supabase.from('receivables').insert([{
        user_id: supabaseUserId, debtor_name: note, amount: amount, paid_amount: 0, debt_date: new Date().toISOString()
      }]).select('id').single();

      if (error) throw error;
      return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined,
        `✅ *Piutang Berhasil Dicatat!*\n\nPeminjam: ${note}\nJumlah: ${fm(amount)}`, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([Markup.button.callback('❌ Batalkan (Undo)', `undo_rcv_${data.id}`)])
      });
    } catch (err) {
      return ctx.reply(`❌ Error: ${err.message}`);
    }
  }

  // Save to pending state for Expense, Income, Asset, Debt
  const txId = `req_${Date.now()}`;
  pendingData.set(txId, { type, amount, note });

  let categories = [];
  let typeStr = "";
  if (type === 'expense') { categories = ['Food & Dining', 'Transportation', 'Shopping', 'Bills', 'Lainnya']; typeStr = '🔴 Pengeluaran'; }
  else if (type === 'income') { categories = ['Salary', 'Bonus', 'Investment', 'Lainnya']; typeStr = '🟢 Pemasukan'; }
  else if (type === 'asset') { categories = ['Tunai', 'Tabungan', 'Investasi', 'Properti', 'Lainnya']; typeStr = '💎 Aset Baru'; }
  else if (type === 'debt') { categories = ['Pinjol', 'Kartu Kredit', 'KPR/KKB', 'Pribadi', 'Lainnya']; typeStr = '💳 Hutang Baru'; }

  const buttons = categories.map(cat => Markup.button.callback(cat, `cat_${txId}_${cat}`));
  const keyboardRows = [];
  for (let i = 0; i < buttons.length; i += 2) { keyboardRows.push(buttons.slice(i, i + 2)); }

  ctx.reply(`*Draft ${typeStr}*\nJumlah: ${fm(amount)}\nKeterangan: ${note}\n\n👇 *Pilih Kategori:*`, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard(keyboardRows)
  });
});

// 6. Handle Inline Category Selection
bot.action(/cat_(req_[0-9]+)_(.+)/, async (ctx) => {
  const txId = ctx.match[1];
  const category = ctx.match[2];

  const pending = pendingData.get(txId);
  if (!pending) return ctx.answerCbQuery("❌ Sesi sudah diproses.", { show_alert: true });

  try {
    // Add catch to answerCbQuery to prevent unhandled rejections
    ctx.answerCbQuery("Menyimpan...").catch(err => console.error("answerCbQuery error:", err));
    await ctx.editMessageText(`⏳ Menyimpan ke database...`);

    let table = 'transactions';
    let payload = {};
    let undoPrefix = 'tx';

    if (pending.type === 'expense' || pending.type === 'income') {
      table = 'transactions';
      undoPrefix = 'tx';
      payload = { user_id: supabaseUserId, type: pending.type, amount: pending.amount, category: category, note: pending.note, date: new Date().toISOString() };
    } else if (pending.type === 'asset') {
      table = 'assets';
      undoPrefix = 'ast';
      payload = { user_id: supabaseUserId, name: pending.note, category: category, amount: pending.amount };
    } else if (pending.type === 'debt') {
      table = 'debts';
      undoPrefix = 'dbt';
      payload = { user_id: supabaseUserId, name: pending.note, category: category, amount: pending.amount };
    }

    const { data, error } = await supabase.from(table).insert([payload]).select('id').single();
    if (error) throw error;

    pendingData.delete(txId);

    let typeStr = "";
    if (pending.type === 'expense') typeStr = '🔴 Pengeluaran';
    if (pending.type === 'income') typeStr = '🟢 Pemasukan';
    if (pending.type === 'asset') typeStr = '💎 Aset';
    if (pending.type === 'debt') typeStr = '💳 Hutang';

    await ctx.editMessageText(
      `✅ *Berhasil dicatat!*\n\n${typeStr}: ${fm(pending.amount)}\nKategori: ${category}\nKeterangan: ${pending.note}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([Markup.button.callback('❌ Batalkan (Undo)', `undo_${undoPrefix}_${data.id}`)])
      }
    );
  } catch (error) {
    console.error("Error saving to database:", error);
    try {
      await ctx.editMessageText(`❌ Terjadi kesalahan: ${error.message || String(error)}`);
    } catch (editError) {
      console.error("Error editing message in catch:", editError);
      await ctx.reply(`❌ Terjadi kesalahan saat menyimpan data: ${error.message || String(error)}`).catch(e => console.error("Reply error:", e));
    }
  }
});

// 7. Handle Undo Action
bot.action(/undo_(tx|ast|dbt|rcv)_(.+)/, async (ctx) => {
  const prefix = ctx.match[1];
  const dbId = ctx.match[2];

  let table = 'transactions';
  if (prefix === 'ast') table = 'assets';
  if (prefix === 'dbt') table = 'debts';
  if (prefix === 'rcv') table = 'receivables';

  try {
    ctx.answerCbQuery("Membatalkan...");
    const { error } = await supabase.from(table).delete().eq('id', dbId).eq('user_id', supabaseUserId);
    if (error) throw error;

    const currentText = ctx.callbackQuery.message.text;
    await ctx.editMessageText(`⏪ *Dibatalkan!*\n\n~${currentText.replace('✅ Berhasil dicatat!', '').replace('✅ Piutang Berhasil Dicatat!', '').trim()}~`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.answerCbQuery("❌ Gagal membatalkan.", { show_alert: true });
  }
});

// 8. Vercel Serverless Function Handler (Webhook)
module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body, res);
      if (!res.writableEnded) {
        res.status(200).send('OK');
      }
    } else {
      res.status(200).send('Bot is running (Webhook mode)!');
    }
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).send('Internal Server Error');
  }
};
