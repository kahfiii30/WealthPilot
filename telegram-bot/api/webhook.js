require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const { parseWithAI, answerFinancialQuery } = require('./ai-parser');
const { getFinancialSummary } = require('./finance-summary');
const { checkBudgetWarning } = require('./budget-checker');

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
    let chartUrl = "";

    txResMonth.data.forEach(t => {
      if (t.type === 'income') incomeMonth += Number(t.amount);
      if (t.type === 'expense') {
        expenseMonth += Number(t.amount);
        if (t.category) {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        }
      }
    });

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
            legend: { position: 'right', labels: { fontColor: '#f1f5f9', fontSize: 14, fontFamily: 'sans-serif' } },
            datalabels: { color: '#ffffff', font: { weight: 'bold', size: 12, family: 'sans-serif' } },
            doughnutlabel: { labels: [{ text: 'Expense', font: { size: 20, weight: 'bold' }, color: '#94a3b8' }] }
          },
          layout: { padding: 20 }
        }
      };
      chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%23020617&width=600&height=300`;
    }
    
    let incomeAll = 0;
    let expenseAll = 0;
    let methodBalances = {};
    let methodNames = {}; // store original case for display

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

    let btcPrice = 0;
    try {
      const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr');
      const btcData = await btcRes.json();
      btcPrice = btcData.bitcoin.idr;
    } catch(e) {
      console.log("Failed to fetch crypto price");
    }

    let totalAssets = 0;
    for (let a of assetRes.data) {
      let amount = Number(a.amount);
      if (a.asset_type === 'crypto' && a.symbol && a.quantity) {
        if (a.symbol.toLowerCase() === 'btc' || a.symbol.toLowerCase() === 'bitcoin') {
          amount = a.quantity * btcPrice;
          // Dynamically update the amount in memory so it reflects correctly
          a.amount = amount;
        }
      } else if (a.name.toUpperCase().includes('BITCOIN') && a.amount > 0 && btcPrice > 0) {
        // Fallback: If it's the old BITCOIN entry and has no quantity, assume it's just IDR value, or if they update it to be 0.0016 BTC in the name we could parse it, but for now we rely on DB schema update. 
        // Wait, the DB schema is updated but they haven't filled 'quantity' yet. 
        // We will just leave it as fiat amount if quantity is missing.
      }
      totalAssets += amount;
    }
    let totalDebts = debtRes.data.reduce((acc, d) => acc + Number(d.amount), 0);
    
    let totalReceivables = recRes.data.reduce((acc, r) => acc + (Number(r.amount) - Number(r.paid_amount)), 0);

    const balanceMonth = incomeMonth - expenseMonth;

    let methodDetails = "";
    let assetDetails = assetRes.data.map(a => `   ├ 💎 ${a.name}: \`${fm(a.amount)}\`\n`).join('');
    let debtDetails = debtRes.data.map(d => `   ├ 💳 ${d.name}: \`${fm(d.amount)}\`\n`).join('');
    let recDetails = recRes.data.map(r => `   ├ 🤝 ${r.debtor_name}: \`${fm(r.amount - r.paid_amount)}\`\n`).join('');

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
        const methodLower = method.toLowerCase();
        if (methodLower.includes('cash')) icon = '💵';
        else if (methodLower.includes('bca') || methodLower.includes('mandiri') || methodLower.includes('seabank')) icon = '💳';
        else if (methodLower.includes('invest')) icon = '📈';
        
        methodDetails += `   ├ ${icon} *${method}*: \`${fm(amount)}\`\n`;
        totalAccountBalance += amount;
      });

    const formatList = (str) => {
      if (!str) return '   └ 📭 Belum ada data\n';
      return str.replace(/├([^├]*)$/, '└$1'); // Change last ├ to └
    };

    const reportMsg = `🌟 𝐖 𝐄 𝐀 𝐋 𝐓 𝐇 𝐏 𝐈 𝐋 𝐎 𝐓 🌟\n` +
      `═══════════════════════\n` +
      `📊 *𝗠𝗼𝗻𝘁𝗵𝗹𝘆 𝗜𝗻𝘀𝗶𝗴𝗵𝘁:* ${monthStr}\n\n` +
      `🟢 Pemasukan: \`${fm(incomeMonth)}\`\n` +
      `🔴 Pengeluaran: \`${fm(expenseMonth)}\`\n` +
      `💰 Sisa Cashflow: \`${fm(balanceMonth)}\`\n\n` +
      `💳 *𝗔𝗰𝗰𝗼𝘂𝗻𝘁𝘀 & 𝗪𝗮𝗹𝗹𝗲𝘁𝘀*\n` +
      formatList(methodDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗟𝗶𝗾𝘂𝗶𝗱: \`${fm(totalAccountBalance)}\`*\n\n` +
      `💎 *𝗣𝗼𝗿𝘁𝗳𝗼𝗹𝗶𝗼 𝗔𝘀𝘀𝗲𝘁𝘀*\n` +
      formatList(assetDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗔𝘀𝘀𝗲𝘁𝘀: \`${fm(totalAssets)}\`*\n\n` +
      `💳 *𝗟𝗶𝗮𝗯𝗶𝗹𝗶𝘁𝗶𝗲𝘀 (𝗗𝗲𝗯𝘁𝘀)*\n` +
      formatList(debtDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗗𝗲𝗯𝘁𝘀: \`${fm(totalDebts)}\`*\n\n` +
      `🤝 *𝗥𝗲𝗰𝗲𝗶𝘃𝗮𝗯𝗹𝗲𝘀*\n` +
      formatList(recDetails) +
      `✨ *𝗧𝗼𝘁𝗮𝗹 𝗥𝗲𝗰𝗲𝗶𝘃𝗮𝗯𝗹𝗲𝘀: \`${fm(totalReceivables)}\`*\n` +
      `═══════════════════════\n` +
      `⚖️ *𝗡𝗲𝘁 𝗪𝗼𝗿𝘁𝗵:* \`${fm(totalAccountBalance + totalAssets + totalReceivables - totalDebts)}\``;
    
    if (chartUrl) {
      await ctx.replyWithPhoto(chartUrl, { caption: reportMsg, parse_mode: 'Markdown' });
    } else {
      ctx.reply(reportMsg, { parse_mode: 'Markdown' });
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
      if (!process.env.GEMINI_API_KEY) {
        return ctx.reply('❌ Format tidak dikenali. Gunakan format manual.', { parse_mode: 'Markdown' });
      }
      const msg = await ctx.reply('⏳ Menganalisis pesan dengan AI...');
      const aiResult = await parseWithAI(ctx.message.text);
      if (!aiResult) {
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '❌ AI gagal memahami pesan ini.');
      }
      type = aiResult.type;
      amountStr = aiResult.amount.toString();
      note = aiResult.note;
      ctx.state = ctx.state || {};
      ctx.state.aiCategory = aiResult.category;
      ctx.state.aiMethod = aiResult.method;
      await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '\u2705 Pesan dipahami oleh AI (Tipe: ' + type.toUpperCase() + ').');
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

  // If AI already provided a category, we can insert immediately
    if (ctx.state && ctx.state.aiCategory && (type === 'expense' || type === 'income')) {
      try {
        const msg = await ctx.reply("⏳ Menyimpan transaksi...");
        const now = new Date();
        const jkt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const localDateStr = `${jkt.getFullYear()}-${String(jkt.getMonth() + 1).padStart(2, '0')}-${String(jkt.getDate()).padStart(2, '0')}`;
        
        let method = ctx.state.aiMethod || 'Cash';
        const payload = { user_id: supabaseUserId, type: type, amount: amount, category: ctx.state.aiCategory, note: note, date: localDateStr, method: method };
        
        const { data, error } = await supabase.from('transactions').insert([payload]).select('id').single();
        if (error) throw error;
        
        if (type === 'expense') {
          checkBudgetWarning(ctx, supabaseUserId, ctx.state.aiCategory, amount);
        }
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, 
          `✅ *Berhasil dicatat otomatis oleh AI!*

📝 ${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${fm(amount)}
Kategori: ${ctx.state.aiCategory}
Metode: ${method}
Keterangan: ${note}`, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([ Markup.button.callback('❌ Batalkan (Undo)', `undo_tx_${data.id}`) ])
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
    
    if (pending.type === 'expense') {
        checkBudgetWarning(ctx, supabaseUserId, category, pending.amount);
      }
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
