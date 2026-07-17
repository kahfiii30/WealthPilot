const fs = require('fs');
let code = fs.readFileSync('telegram-bot/bot.js', 'utf8');

const target = /\/\/ Save to pending state for Expense, Income, Asset, Debt\s*const txId = `req_\$\{Date\.now\(\)\}`;/i;

const replacement = `// If AI already provided a category, we can insert immediately
    if (ctx.state && ctx.state.aiCategory && (type === 'expense' || type === 'income')) {
      try {
        const msg = await ctx.reply("⏳ Menyimpan transaksi...");
        const now = new Date();
        const jkt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
        const localDateStr = \`\${jkt.getFullYear()}-\${String(jkt.getMonth() + 1).padStart(2, '0')}-\${String(jkt.getDate()).padStart(2, '0')}\`;
        
        let method = ctx.state.aiMethod || 'Cash';
        const payload = { user_id: supabaseUserId, type: type, amount: amount, category: ctx.state.aiCategory, note: note, date: localDateStr, method: method };
        
        const { data, error } = await supabase.from('transactions').insert([payload]).select('id').single();
        if (error) throw error;
        
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, 
          \`✅ *Berhasil dicatat otomatis oleh AI!*\n\n📝 \${type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: \${fm(amount)}\nKategori: \${ctx.state.aiCategory}\nMetode: \${method}\nKeterangan: \${note}\`, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([ Markup.button.callback('❌ Batalkan (Undo)', \`undo_tx_\${data.id}\`) ])
        });
      } catch (err) {
        return ctx.reply(\`❌ Error: \${err.message}\`);
      }
    }

    // Save to pending state for Expense, Income, Asset, Debt
    const txId = \`req_\${Date.now()}\`;`;

code = code.replace(target, replacement);
fs.writeFileSync('telegram-bot/bot.js', code);
console.log("Patched bot.js 2");
