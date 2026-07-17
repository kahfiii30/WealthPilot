const fs = require('fs');
let code = fs.readFileSync('telegram-bot/bot.js', 'utf8');

// 1. Require getFinancialSummary and answerFinancialQuery
if (!code.includes("getFinancialSummary")) {
  code = code.replace(/const \{ parseWithAI \} = require\('\.\/ai-parser'\);/i, "const { parseWithAI, answerFinancialQuery } = require('./ai-parser');\nconst { getFinancialSummary } = require('./finance-summary');");
}

// 2. Replace the parseWithAI block
const targetNLP = /const parsed = await parseWithAI\(text\);\s*if \(\!parsed \|\| \!parsed\.type\)/i;

const newNLP = `const parsedResponse = await parseWithAI(text);
    if (!parsedResponse) {
      return ctx.reply('❌ Format tidak dikenali. Gunakan format manual.', { parse_mode: 'Markdown' });
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

    const parsed = parsedResponse.data;
    if (!parsed || !parsed.type)`;

code = code.replace(targetNLP, newNLP);

fs.writeFileSync('telegram-bot/bot.js', code);
console.log("Patched bot.js for AI Chatbot");
