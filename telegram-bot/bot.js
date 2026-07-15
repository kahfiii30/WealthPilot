require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');

// 1. Setup Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env");
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

// Pending Transactions Memory Store
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
  ctx.reply("💡 *Cara Cepat Mencatat:*\n\n1. Pengeluaran: `keluar 50000 makan`\n2. Pemasukan: `masuk 2000000 gaji`\n3. Hutang Baru: `hutang 50000 pinjol`\n4. Aset Baru: `aset 1000000 bca`\n5. Piutang Baru: `piutang 50000 budi`\n\n*(Catatan: Jangan gunakan kata 'masuk/keluar' untuk Aset, Hutang, atau Piutang)*\n\n🗑️ *Cara Menghapus Data:*\nKetik `hapus <tipe> <kata kunci nama>`\nContoh:\n- `hapus aset bca`\n- `hapus hutang pinjol`\n- `hapus pengeluaran makan`\n\n📋 *Cara Melihat Daftar Data:*\nKetik:\n- `list aset`\n- `list hutang`\n- `list piutang`", { parse_mode: 'Markdown' });
});
bot.hears('⚙️ Pengaturan', (ctx) => {
  ctx.reply("⚙️ *Pengaturan Koneksi*\nStatus: ✅ Terhubung ke Supabase\nFitur Premium: Aktif (Aset, Hutang, Piutang Tersinkronisasi)", { parse_mode: 'Markdown' });
});

bot.command('report', (ctx) => handleReport(ctx));

// Function to handle Monthly Report & Portfolio
async function handleReport(ctx) {
  try {
    ctx.reply("⏳ Menarik data portofolio dari Supabase...");
    
    // Use Asia/Jakarta time for accurate monthly reporting
    const d = new Date();
    const jakartaTime = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const year = jakartaTime.getFullYear();
    const month = String(jakartaTime.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, jakartaTime.getMonth() + 1, 0).getDate(); // Get last day of month
    const monthStr = `${year}-${month}`;
    
    // Use prefix matching to ensure both 'YYYY-MM-DD' and 'YYYY-MM-DDT...' formats are captured
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    // Fetch all required data in parallel
    const [txResMonth, txResAll, assetRes, debtRes, recRes] = await Promise.all([
      supabase.from('transactions').select('amount, type, category').eq('user_id', supabaseUserId).gte('date', startDate).lte('date', endDate),
      supabase.from('transactions').select('amount, type, method').eq('user_id', supabaseUserId),
      supabase.from('assets').select('name, amount').eq('user_id', supabaseUserId),
      supabase.from('debts').select('name, amount').eq('user_id', supabaseUserId),
      supabase.from('receivables').select('debtor_name, amount, paid_amount').eq('user_id', supabaseUserId)
    ]);

    if (txResMonth.error) throw txResMonth.error;
    if (txResAll.error) throw txResAll.error;
    if (assetRes.error) throw assetRes.error;
    if (debtRes.error) throw debtRes.error;
    if (recRes.error) throw recRes.error;

    let incomeMonth = 0;
    let expenseMonth = 0;
    let categoryTotals = {};

    txResMonth.data.forEach(t => {
      if (t.type === 'income') incomeMonth += Number(t.amount);
      if (t.type === 'expense') {
        expenseMonth += Number(t.amount);
        if (t.category) {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        }
      }
    });
    
    let incomeAll = 0;
    let expenseAll = 0;
    let methodBalances = {};

    // Initialize method balances from assets
    assetRes.data.forEach(a => {
      methodBalances[a.name] = Number(a.amount);
    });

    txResAll.data.forEach(t => {
      if (t.type === 'income') incomeAll += Number(t.amount);
      if (t.type === 'expense') expenseAll += Number(t.amount);

      const method = t.method || 'Cash';
      if (methodBalances[method] === undefined) methodBalances[method] = 0;

      if (t.type === 'income') methodBalances[method] += Number(t.amount);
      if (t.type === 'expense') methodBalances[method] -= Number(t.amount);
    });

    let totalAssets = assetRes.data.reduce((acc, a) => acc + Number(a.amount), 0);
    let totalDebts = debtRes.data.reduce((acc, d) => acc + Number(d.amount), 0);
    
    let totalReceivables = recRes.data.reduce((acc, r) => acc + (Number(r.amount) - Number(r.paid_amount)), 0);

    const balanceMonth = incomeMonth - expenseMonth;
    const balanceAll = incomeAll - expenseAll;

    let methodDetails = "";
    Object.entries(methodBalances)
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .forEach(([method, amount]) => {
        let icon = '🏦';
        if (method.toLowerCase().includes('cash')) icon = '💵';
        methodDetails += `   ├ ${icon} ${method}: ${fm(amount)}\n`;
      });
      
    const totalAccountBalance = Object.values(methodBalances).reduce((a, b) => a + b, 0);

    const reportMsg = `📊 *Laporan Bulan Ini (${monthStr})*\n\n` +
      `🟢 Pemasukan: ${fm(incomeMonth)}\n🔴 Pengeluaran: ${fm(expenseMonth)}\n💰 Sisa Cashflow: ${fm(balanceMonth)}\n\n` +
      `💳 *Saldo Rekening (Dompet/Bank):*\n` +
      (methodDetails ? `${methodDetails}` : '   ├ Belum ada data\n') +
      `💰 *Total Saldo: ${fm(totalAccountBalance)}*\n\n` +
      `🏦 *Portofolio Tambahan:*\n` +
      `💎 Total Aset Tetap: ${fm(totalAssets)}\n` +
      `💳 Total Hutang: ${fm(totalDebts)}\n` +
      `🤝 Total Piutang: ${fm(totalReceivables)}\n\n` +
      `⚖️ *Net Worth Bersih:* ${fm(totalAccountBalance + totalAssets + totalReceivables - totalDebts)}`;
    
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

  const deleteMatch = text.match(/^(hapus|delete)\s+(aset|asset|hutang|utang|piutang|transaksi|pengeluaran|pemasukan)\s+(.+)$/i);
  if (deleteMatch) {
    const delType = deleteMatch[2].toLowerCase();
    const keyword = deleteMatch[3].trim();
    
    let table = '';
    let nameColumn = '';
    let typePrefix = '';
    let isTx = false;
    
    if (delType === 'aset' || delType === 'asset') { table = 'assets'; nameColumn = 'name'; typePrefix = 'ast'; }
    else if (delType === 'hutang' || delType === 'utang') { table = 'debts'; nameColumn = 'name'; typePrefix = 'dbt'; }
    else if (delType === 'piutang') { table = 'receivables'; nameColumn = 'debtor_name'; typePrefix = 'rcv'; }
    else { table = 'transactions'; nameColumn = 'note'; typePrefix = 'tx'; isTx = true; }

    try {
      const msg = await ctx.reply(`🔍 Mencari ${delType} dengan kata kunci "${keyword}"...`);
      const suId = supabaseUserId; 
      
      let query = supabase.from(table).select(`id, amount, ${nameColumn}${isTx ? ', type' : ''}`).eq('user_id', suId).ilike(nameColumn, `%${keyword}%`).order('created_at', { ascending: false }).limit(5);
      
      if (isTx && delType === 'pengeluaran') query = query.eq('type', 'expense');
      if (isTx && delType === 'pemasukan') query = query.eq('type', 'income');

      const { data, error } = await query;
      if (error) throw error;
      if (!data || data.length === 0) {
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `❌ Tidak ditemukan ${delType} dengan kata kunci "${keyword}".`);
      }

      const buttons = data.map(item => {
        const title = item[nameColumn] || 'Tanpa Nama';
        let btnText = `${title} - ${fm(item.amount)}`;
        if (isTx) btnText = `[${item.type === 'income' ? 'Masuk' : 'Keluar'}] ` + btnText;
        return [Markup.button.callback(`🗑️ ${btnText}`, `del_${typePrefix}_${item.id}`)];
      });
      buttons.push([Markup.button.callback('❌ Batal', 'cancel_delete')]);

      return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `Menemukan ${data.length} hasil untuk "${keyword}". Pilih yang ingin dihapus:`, {
        ...Markup.inlineKeyboard(buttons)
      });
    } catch (err) {
      return ctx.reply(`❌ Error: ${err.message}`);
    }
  }

  const listMatch = text.match(/^(list|daftar|cek)\s+(aset|asset|hutang|utang|piutang)$/i);
  if (listMatch) {
    const listType = listMatch[2].toLowerCase();
    let table = '';
    let nameColumn = '';
    let typeStr = '';
    
    if (listType === 'aset' || listType === 'asset') { table = 'assets'; nameColumn = 'name'; typeStr = 'Aset'; }
    else if (listType === 'hutang' || listType === 'utang') { table = 'debts'; nameColumn = 'name'; typeStr = 'Hutang'; }
    else if (listType === 'piutang') { table = 'receivables'; nameColumn = 'debtor_name'; typeStr = 'Piutang'; }

    try {
      const msg = await ctx.reply(`⏳ Mengambil daftar ${typeStr}...`);
      const suId = supabaseUserId;
      
      const { data, error } = await supabase.from(table).select(`id, amount, ${nameColumn}`).eq('user_id', suId).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;

      if (!data || data.length === 0) {
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `📝 Daftar ${typeStr} kamu masih kosong.`);
      }

      let listText = `📋 *Daftar ${typeStr}*\n\n`;
      let total = 0;
      data.forEach((item, index) => {
        const title = item[nameColumn] || 'Tanpa Nama';
        listText += `${index + 1}. ${title} - ${fm(item.amount)}\n`;
        total += Number(item.amount);
      });
      listText += `\n💰 *Total: ${fm(total)}*`;

      return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, listText, { parse_mode: 'Markdown' });
    } catch (err) {
      return ctx.reply(`❌ Error: ${err.message}`);
    }
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
          ...Markup.inlineKeyboard([ Markup.button.callback('❌ Batalkan (Undo)', `undo_rcv_${data.id}`) ])
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
      const now = new Date();
      const jkt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      const localDateStr = `${jkt.getFullYear()}-${String(jkt.getMonth() + 1).padStart(2, '0')}-${String(jkt.getDate()).padStart(2, '0')}`;
      payload = { user_id: supabaseUserId, type: pending.type, amount: pending.amount, category: category, note: pending.note, date: localDateStr };
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
        ...Markup.inlineKeyboard([ Markup.button.callback('❌ Batalkan (Undo)', `undo_${undoPrefix}_${data.id}`) ])
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

bot.action(/del_(tx|ast|dbt|rcv)_(.+)/, async (ctx) => {
  const prefix = ctx.match[1];
  const dbId = ctx.match[2];
  
  let table = 'transactions';
  let typeStr = 'Transaksi';
  if (prefix === 'ast') { table = 'assets'; typeStr = 'Aset'; }
  if (prefix === 'dbt') { table = 'debts'; typeStr = 'Hutang'; }
  if (prefix === 'rcv') { table = 'receivables'; typeStr = 'Piutang'; }
  
  try {
    ctx.answerCbQuery("Menghapus...").catch(e => console.error(e));
    const suId = supabaseUserId; 
    const { error } = await supabase.from(table).delete().eq('id', dbId).eq('user_id', suId);
    if (error) throw error;

    await ctx.editMessageText(`✅ *Berhasil dihapus!*\n\n${typeStr} tersebut telah dihapus dari sistem.`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.answerCbQuery("❌ Gagal menghapus.", { show_alert: true }).catch(e => console.error(e));
  }
});

bot.action('cancel_delete', async (ctx) => {
  ctx.answerCbQuery().catch(e => console.error(e));
  await ctx.editMessageText("❌ Dibatalkan.");
});

// 8. Start the bot
bot.launch().then(() => {
  console.log("🚀 WealthPilot Telegram Bot V2 is running...");
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
