const fs = require('fs');

function fixFile(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');

  // Add requires if missing
  if (!code.includes("getFinancialSummary")) {
    code = code.replace(/const \{ parseWithAI \} = require\('\.\/ai-parser'\);/i, "const { parseWithAI, answerFinancialQuery } = require('./ai-parser');\nconst { getFinancialSummary } = require('./finance-summary');");
  }

  // Replace the else block
  const startIdx = code.indexOf("if (!process.env.GEMINI_API_KEY) {");
  if (startIdx === -1) {
    console.log("Could not find start index in " + filePath);
    return;
  }
  
  // Backtrack to 'else {'
  const elseIdx = code.lastIndexOf("else {", startIdx);
  if (elseIdx === -1) {
    console.log("Could not find else { in " + filePath);
    return;
  }

  const endStr = "await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '✅ Pesan dipahami oleh AI (Tipe: ' + type.toUpperCase() + ').');\n    }";
  const endIdx = code.indexOf(endStr, elseIdx);
  
  if (endIdx === -1) {
    console.log("Could not find end index in " + filePath);
    return;
  }

  const targetBlock = code.substring(elseIdx, endIdx + endStr.length);

  const newBlock = `else {
      if (!process.env.GEMINI_API_KEY) {
        return ctx.reply('❌ Format tidak dikenali. Gunakan format manual. (API Key Belum Diatur)', { parse_mode: 'Markdown' });
      }
      const msg = await ctx.reply('⏳ Menganalisis pesan dengan AI...');
      const parsedResponse = await parseWithAI(ctx.message.text);
      if (!parsedResponse) {
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '❌ AI gagal memahami pesan ini.');
      }
      
      if (parsedResponse.intent === 'query_finance') {
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, "⏳ Menarik data portofolio dari Supabase...");
        const summary = await getFinancialSummary(supabaseUserId);
        if (!summary) {
          return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, "❌ Gagal menarik data keuangan dari database.");
        }
        
        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, "🤔 Menganalisa pertanyaan...");
        const answer = await answerFinancialQuery(parsedResponse.data.question, summary);
        
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, answer);
      }

      const aiResult = parsedResponse.data;
      if (!aiResult || !aiResult.type) {
         return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '❌ Format tidak dikenali. Gunakan format manual.');
      }

      type = aiResult.type;
      amountStr = (aiResult.amount || 0).toString();
      note = aiResult.note;
      ctx.state = ctx.state || {};
      ctx.state.aiCategory = aiResult.category;
      ctx.state.aiMethod = aiResult.method;
      await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, '✅ Pesan dipahami oleh AI (Tipe: ' + type.toUpperCase() + ').');
    }`;

  code = code.replace(targetBlock, newBlock);
  fs.writeFileSync(filePath, code);
  console.log("Fixed " + filePath);
}

fixFile('telegram-bot/bot.js');
fixFile('telegram-bot/api/webhook.js');
