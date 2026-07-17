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

// 3. (Multi-User) We no longer use .env variables for auth
// We dynamically fetch from telegram_accounts table

// Formatter
const fm = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

// Middleware for access control
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id?.toString();

  if (ctx.message && ctx.message.text === '/start') {
    return next();
  }

  if (!userId) return;

  const { data, error } = await supabase
    .from('telegram_accounts')
    .select('user_id')
    .eq('telegram_id', userId)
    .maybeSingle();

  if (error || !data) {
    ctx.reply(`⚠️ Akun Anda belum terhubung. Silakan login ke website WealthPilot, buka menu Settings -> Integrations, lalu masukkan Telegram ID Anda: \`${userId}\``, { parse_mode: 'Markdown' });
    return;
  }

  // Inject supabaseUserId into state
  ctx.state.supabaseUserId = data.user_id;

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
  ctx.reply("💡 *Cara Cepat Mencatat:*\n\n1. Pengeluaran: `keluar 50000 makan`\n2. Pemasukan: `masuk 2000000 gaji`\n3. Hutang Baru: `hutang 50000 pinjol`\n4. Aset Baru: `aset 1000000 bca`\n5. Piutang Baru: `piutang 50000 budi`\n\n*(Catatan: Jangan gunakan kata 'masuk/keluar' untuk Aset, Hutang, atau Piutang)*\n\n📉 *Cara Mengurangi Nominal (Bayar Hutang/Piutang/Pakai Aset):*\nKetik `kurang/bayar <tipe> <nominal> <kata kunci>`\nContoh:\n- `bayar piutang 50000 budi`\n- `kurang aset 20000 bca`\n- `bayar hutang 100000 pinjol`\n\n🗑️ *Cara Menghapus Data:*\nKetik `hapus <tipe> <kata kunci nama>`\nContoh:\n- `hapus aset bca`\n- `hapus hutang pinjol`\n- `hapus pengeluaran makan`\n\n📋 *Cara Melihat Daftar Data:*\nKetik:\n- `list aset`\n- `list hutang`\n- `list piutang`", { parse_mode: 'Markdown' });
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

    // Use string boundary matching to ensure both 'YYYY-MM-DD' and 'YYYY-MM-DDT...' formats are captured
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    const supabaseUserId = ctx.state.supabaseUserId;

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
    let methodNames = {};

    // Initialize method balances from assets
    assetRes.data.forEach(a => {
      const key = a.name.toUpperCase();
      methodBalances[key] = Number(a.amount);
      methodNames[key] = a.name;
    });

    const coreMethods = ['Cash', 'BCA', 'Mandiri', 'Seabank'];
    coreMethods.forEach(m => {
      const key = m.toUpperCase();
      if (methodBalances[key] === undefined) {
         methodBalances[key] = 0;
         methodNames[key] = m;
      }
    });

    txResAll.data.forEach(t => {
      if (t.type === 'income') incomeAll += Number(t.amount);
      if (t.type === 'expense') expenseAll += Number(t.amount);

      let method = (t.method || '').trim();
      const upperMethod = method.toUpperCase();
      if (!method || upperMethod === '-' || upperMethod === '0' || upperMethod === 'BANK TRANSFER') {
        method = 'Cash';
      }
      
      const key = method.toUpperCase();
      if (methodBalances[key] === undefined) {
        methodBalances[key] = 0;
        methodNames[key] = method;
      }

      if (t.type === 'income') methodBalances[key] += Number(t.amount);
      if (t.type === 'expense') methodBalances[key] -= Number(t.amount);
    });

    let totalAssets = 0;
    let assetDetails = "";
    assetRes.data.forEach(a => {
      totalAssets += Number(a.amount);
      assetDetails += `   ├ ${a.name}: ${fm(a.amount)}\n`;
    });

    let totalDebts = 0;
    let debtDetails = "";
    debtRes.data.forEach(d => {
      totalDebts += Number(d.amount);
      debtDetails += `   ├ ${d.name}: ${fm(d.amount)}\n`;
    });

    let totalReceivables = 0;
    let recDetails = "";
    recRes.data.forEach(r => {
      const sisa = Number(r.amount) - Number(r.paid_amount);
      if (sisa > 0) {
        totalReceivables += sisa;
        recDetails += `   ├ ${r.debtor_name}: ${fm(sisa)}\n`;
      }
    });

    const balanceMonth = incomeMonth - expenseMonth;
    const balanceAll = incomeAll - expenseAll;

    let methodDetails = "";
    let totalAccountBalance = 0;
    Object.entries(methodBalances)
      .filter(([key, amount]) => {
        const method = methodNames[key];
        const isCore = coreMethods.some(m => m.toUpperCase() === method.toUpperCase());
        const isAsset = assetRes.data.some(a => a.name.toUpperCase() === method.toUpperCase());
        
        // Hide assets from the bank account list to prevent double counting
        if (isAsset) return false;
        
        if (isCore) return true;
        if (amount === 0) return false;
        if (method === '-' || method === '0') return false;
        return true;
      })
      .sort((a, b) => b[1] - a[1]) // Sort by amount descending
      .forEach(([key, amount]) => {
        const method = methodNames[key];
        let icon = '💳';
        if (method.toLowerCase().includes('cash')) icon = '💵';
        methodDetails += `   ├ ${icon} ${method}: ${fm(amount)}\n`;
        totalAccountBalance += amount;
      });

    const formatList = (str) => {
      if (!str) return '   └ 📭 Belum ada data\n';
      return str.replace(/├([^├]*)$/, '└$1'); // Change last ├ to └
    };

    const reportMsg = `🌟 𝐖 𝐄 𝐀 𝐋 𝐓 𝐇 𝐏 𝐈 𝐋 𝐎 𝐓 🌟\n` +
      `═══════════════════════\n` +
      `📊 *𝗠𝗼𝗻𝘁𝗵𝗹𝘆 𝗜𝗻𝘀𝗶𝗴𝗵𝘁:* ${monthStr}\n\n` +
      `🟢 Pemasukan: ${fm(incomeMonth)}\n` +
      `🔴 Pengeluaran: ${fm(expenseMonth)}\n` +
      `💰 Sisa Cashflow: ${fm(balanceMonth)}\n\n` +
      `💳 *𝗔𝗰𝗰𝗼𝘂𝗻𝘁𝘀 & 𝗪𝗮𝗹𝗹𝗲𝘁𝘀*\n` +
      formatList(methodDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗟𝗶𝗾𝘂𝗶𝗱: ${fm(totalAccountBalance)}*\n\n` +
      `💎 *𝗣𝗼𝗿𝘁𝗳𝗼𝗹𝗶𝗼 𝗔𝘀𝘀𝗲𝘁𝘀*\n` +
      formatList(assetDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗔𝘀𝘀𝗲𝘁𝘀: ${fm(totalAssets)}*\n\n` +
      `💳 *𝗟𝗶𝗮𝗯𝗶𝗹𝗶𝘁𝗶𝗲𝘀 (𝗗𝗲𝗯𝘁𝘀)*\n` +
      formatList(debtDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗗𝗲𝗯𝘁𝘀: ${fm(totalDebts)}*\n\n` +
      `🤝 *𝗥𝗲𝗰𝗲𝗶𝘃𝗮𝗯𝗹𝗲𝘀*\n` +
      formatList(recDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗥𝗲𝗰𝗲𝗶𝘃𝗮𝗯𝗹𝗲𝘀: ${fm(totalReceivables)}*\n` +
      `═══════════════════════\n` +
      `⚖️ *𝗡𝗲𝘁 𝗪𝗼𝗿𝘁𝗵:* ${fm(totalAccountBalance + totalAssets + totalReceivables - totalDebts)}`;

    let chartUrl = null;
    const catKeys = Object.keys(categoryTotals);
    if (catKeys.length > 0) {
      const chartConfig = {
        type: 'doughnut',
        data: {
          labels: catKeys,
          datasets: [{ 
            data: catKeys.map(k => categoryTotals[k]),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6'],
            borderWidth: 0,
          }]
        },
        options: {
          plugins: {
            legend: { position: 'right', labels: { fontColor: 'white', fontSize: 14 } },
            datalabels: { color: 'white', font: { weight: 'bold' } }
          },
          title: { display: true, text: `Pengeluaran ${monthStr}`, fontColor: 'white', fontSize: 16 }
        }
      };
      chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%230f172a&width=600&height=300`;
    }

    try {
      if (chartUrl) {
        await ctx.replyWithPhoto({ url: chartUrl }, { caption: reportMsg, parse_mode: 'Markdown' });
      } else {
        await ctx.reply(reportMsg, { parse_mode: 'Markdown' });
      }
    } catch (e) {
      console.error("Failed to send photo:", e);
      await ctx.reply(reportMsg, { parse_mode: 'Markdown' });
    }
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

  const reduceMatch = text.match(/^(kurang|bayar)\s+(aset|asset|piutang|hutang|utang)\s+([0-9.,]+)\s+(.+)$/i);
  if (reduceMatch) {
    const reduceType = reduceMatch[2].toLowerCase();
    const amountStr = reduceMatch[3];
    const keyword = reduceMatch[4].trim();
    const amount = Number(amountStr.replace(/[^0-9]/g, ''));
    if (isNaN(amount) || amount <= 0) return ctx.reply("❌ Jumlah tidak valid.");

    let table = '';
    let nameColumn = '';

    if (reduceType === 'aset' || reduceType === 'asset') { table = 'assets'; nameColumn = 'name'; }
    else if (reduceType === 'hutang' || reduceType === 'utang') { table = 'debts'; nameColumn = 'name'; }
    else if (reduceType === 'piutang') { table = 'receivables'; nameColumn = 'debtor_name'; }

    try {
      const msg = await ctx.reply(`🔍 Mencari ${reduceType} "${keyword}" untuk dikurangi ${fm(amount)}...`);
      const suId = ctx.state.supabaseUserId; 

      const { data, error } = await supabase.from(table).select(`id, amount, ${nameColumn}${table === 'receivables' ? ', paid_amount' : ''}`).eq('user_id', suId).ilike(nameColumn, `%${keyword}%`).order('created_at', { ascending: false }).limit(5);

      if (error) throw error;
      if (!data || data.length === 0) {
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `❌ Tidak ditemukan ${reduceType} dengan kata kunci "${keyword}".`);
      }

      const txId = `red_${Date.now()}`;
      await supabase.from('telegram_drafts').insert([{
        telegram_id: ctx.from.id.toString(),
        tx_id: txId,
        payload: { amount, table, nameColumn }
      }]);

      const buttons = data.map(item => {
        const title = item[nameColumn] || 'Tanpa Nama';
        const currentBal = table === 'receivables' ? (Number(item.amount) - Number(item.paid_amount)) : Number(item.amount);
        return [Markup.button.callback(`📉 Kurangi ${title} (${fm(currentBal)})`, `red_${txId}_${item.id}`)];
      });
      buttons.push([Markup.button.callback('❌ Batal', 'cancel_delete')]);

      return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, `Menemukan ${data.length} hasil untuk "${keyword}". Pilih yang ingin dikurangi nominalnya sebesar ${fm(amount)}:`, {
        ...Markup.inlineKeyboard(buttons)
      });
    } catch (err) {
      return ctx.reply(`❌ Error: ${err.message}`);
    }
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
      const suId = ctx.state.supabaseUserId; 
      
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
      const suId = ctx.state.supabaseUserId;
      
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
        user_id: ctx.state.supabaseUserId, debtor_name: note, amount: amount, paid_amount: 0, debt_date: new Date().toISOString()
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
  
  const { error: draftError } = await supabase.from('telegram_drafts').insert([{
    telegram_id: ctx.from.id.toString(),
    tx_id: txId,
    payload: { type, amount, note, supabaseUserId: ctx.state.supabaseUserId }
  }]);

  if (draftError) {
    return ctx.reply("❌ Gagal membuat draft. Silakan coba lagi.");
  }

  let categories = [];
  let typeStr = "";
  if (type === 'expense') { categories = ['Food & Dining', 'Trading', 'Kebutuhan', 'Transportasi', 'Lainnya']; typeStr = '🔴 Pengeluaran'; }
  else if (type === 'income') { categories = ['Salary', 'Business', 'Bonus', 'Freelance', 'Investment', 'Gift', 'Other Income']; typeStr = '🟢 Pemasukan'; }
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

  const { data: draftData, error: draftError } = await supabase
    .from('telegram_drafts')
    .select('payload')
    .eq('tx_id', txId)
    .maybeSingle();

  if (draftError || !draftData) return ctx.answerCbQuery("❌ Sesi sudah diproses atau kedaluwarsa.", { show_alert: true });
  
  const pending = draftData.payload;
  const supabaseUserId = pending.supabaseUserId;

  try {
    ctx.answerCbQuery("Kategori dipilih.").catch(e => console.error(e));

    // If it's Asset or Debt, save directly (no method needed)
    if (pending.type === 'asset' || pending.type === 'debt') {
      await saveTransactionDraft(ctx, pending, category, null, txId);
      return;
    }

    // Save category to draft and ask for payment method
    const updatedPayload = { ...pending, category };
    await supabase.from('telegram_drafts').update({ payload: updatedPayload }).eq('tx_id', txId);

    // Fetch user assets to show banks
    const { data: assets } = await supabase.from('assets').select('name, category').eq('user_id', supabaseUserId).in('category', ['Bank', 'E-Wallet', 'Cash']);
    
    let methodButtons = [];
    if (assets && assets.length > 0) {
      methodButtons = assets.map(a => Markup.button.callback(a.name, `mthd_${txId}_${a.name}`));
    } else {
      methodButtons = [
        Markup.button.callback('Cash', `mthd_${txId}_Cash`),
        Markup.button.callback('BCA', `mthd_${txId}_BCA`),
        Markup.button.callback('Mandiri', `mthd_${txId}_Mandiri`),
        Markup.button.callback('Seabank', `mthd_${txId}_Seabank`),
        Markup.button.callback('E-Wallet', `mthd_${txId}_E-Wallet`)
      ];
    }

    const keyboardRows = [];
    for (let i = 0; i < methodButtons.length; i += 2) { keyboardRows.push(methodButtons.slice(i, i + 2)); }

    await ctx.editMessageText(`Kategori: ${category}\n\n👇 *Pilih Metode Pembayaran / Bank:*`, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(keyboardRows)
    });

  } catch (error) {
    console.error("Error processing category:", error);
    await ctx.reply(`❌ Terjadi kesalahan: ${error.message}`).catch(e => console.error(e));
  }
});

// 6.5 Handle Method Selection
bot.action(/mthd_(req_[0-9]+)_(.+)/, async (ctx) => {
  const txId = ctx.match[1];
  const method = ctx.match[2];

  const { data: draftData, error: draftError } = await supabase
    .from('telegram_drafts')
    .select('payload')
    .eq('tx_id', txId)
    .maybeSingle();

  if (draftError || !draftData) return ctx.answerCbQuery("❌ Sesi sudah diproses atau kedaluwarsa.", { show_alert: true });

  const pending = draftData.payload;
  
  try {
    ctx.answerCbQuery("Menyimpan...").catch(e => console.error(e));
    await saveTransactionDraft(ctx, pending, pending.category, method, txId);
  } catch (error) {
    console.error("Error processing method:", error);
    await ctx.reply(`❌ Terjadi kesalahan: ${error.message}`).catch(e => console.error(e));
  }
});

async function saveTransactionDraft(ctx, pending, category, method, txId) {
  const supabaseUserId = pending.supabaseUserId;
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
    payload = { user_id: supabaseUserId, type: pending.type, amount: pending.amount, category: category, method: method || 'Cash', note: pending.note, date: localDateStr };
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

  await supabase.from('telegram_drafts').delete().eq('tx_id', txId);

  let typeStr = "";
  if (pending.type === 'expense') typeStr = '🔴 Pengeluaran';
  if (pending.type === 'income') typeStr = '🟢 Pemasukan';
  if (pending.type === 'asset') typeStr = '💎 Aset';
  if (pending.type === 'debt') typeStr = '💳 Hutang';

  let successMsg = `✅ *Berhasil dicatat!*\n\n${typeStr}: ${fm(pending.amount)}\nKategori: ${category}\nKeterangan: ${pending.note}`;
  if (method) successMsg += `\nMetode: ${method}`;

  await ctx.editMessageText(successMsg, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([Markup.button.callback('❌ Batalkan (Undo)', `undo_${undoPrefix}_${data.id}`)])
  });
}

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
    const { error } = await supabase.from(table).delete().eq('id', dbId).eq('user_id', ctx.state.supabaseUserId);
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
    const suId = ctx.state.supabaseUserId; 
    const { error } = await supabase.from(table).delete().eq('id', dbId).eq('user_id', suId);
    if (error) throw error;

    await ctx.editMessageText(`✅ *Berhasil dihapus!*\n\n${typeStr} tersebut telah dihapus dari sistem.`, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.answerCbQuery("❌ Gagal menghapus.", { show_alert: true }).catch(e => console.error(e));
  }
});

bot.action(/red_(red_[0-9]+)_(.+)/, async (ctx) => {
  const txId = ctx.match[1];
  const dbId = ctx.match[2];
  const suId = ctx.state.supabaseUserId;

  const { data: draftData, error: draftError } = await supabase
    .from('telegram_drafts')
    .select('payload')
    .eq('tx_id', txId)
    .maybeSingle();

  if (draftError || !draftData) return ctx.answerCbQuery("❌ Sesi sudah diproses atau kedaluwarsa.", { show_alert: true });
  
  const { amount, table, nameColumn } = draftData.payload;

  try {
    ctx.answerCbQuery("Memproses...").catch(e => console.error(e));
    
    const { data: currentData, error: fetchErr } = await supabase.from(table).select('*').eq('id', dbId).eq('user_id', suId).single();
    if (fetchErr) throw fetchErr;

    let newPayload = {};
    let message = "";

    if (table === 'receivables') {
      const newPaid = Number(currentData.paid_amount) + amount;
      newPayload = { paid_amount: newPaid, updated_at: new Date().toISOString() };
      message = `✅ *Piutang Berhasil Dibayar!*\n\nPeminjam: ${currentData[nameColumn]}\nDibayar: ${fm(amount)}\nSisa Piutang: ${fm(Number(currentData.amount) - newPaid)}`;
    } else {
      let newAmount = Number(currentData.amount) - amount;
      if (newAmount < 0) newAmount = 0;
      newPayload = { amount: newAmount, updated_at: new Date().toISOString() };
      const typeStr = table === 'assets' ? 'Aset' : 'Hutang';
      message = `✅ *${typeStr} Berhasil Dikurangi!*\n\nNama: ${currentData[nameColumn]}\nDikurangi: ${fm(amount)}\nSisa Saldo: ${fm(newAmount)}`;
    }

    const { error: updateErr } = await supabase.from(table).update(newPayload).eq('id', dbId).eq('user_id', suId);
    if (updateErr) throw updateErr;

    await supabase.from('telegram_drafts').delete().eq('tx_id', txId);
    await ctx.editMessageText(message, { parse_mode: 'Markdown' });
  } catch (error) {
    ctx.answerCbQuery("❌ Gagal memproses.", { show_alert: true }).catch(e => console.error(e));
  }
});

bot.action('cancel_delete', async (ctx) => {
  ctx.answerCbQuery().catch(e => console.error(e));
  await ctx.editMessageText("❌ Dibatalkan.");
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
