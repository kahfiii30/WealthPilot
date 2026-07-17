const fs = require('fs');
let code = fs.readFileSync('telegram-bot/bot.js', 'utf8');

const target = /else\s*\{\s*return\s*ctx\.reply\([\s\S]*?Format tidak dikenali[\s\S]*?\}\s*const\s*amount\s*=\s*Number/i;

const replacement = `else {
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
      await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '\\u2705 Pesan dipahami oleh AI (Tipe: ' + type.toUpperCase() + ').');
    }

    const amount = Number`;

code = code.replace(target, replacement);
fs.writeFileSync('telegram-bot/bot.js', code);
console.log("Patched bot.js");
