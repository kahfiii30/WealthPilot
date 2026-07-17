const fs = require('fs');
let code = fs.readFileSync('telegram-bot/bot.js', 'utf8');

// Require the helper
if (!code.includes("const { checkBudgetWarning } = require('./budget-checker');")) {
  code = code.replace(/const \{ parseWithAI \} = require\('\.\/ai-parser'\);/i, "const { parseWithAI } = require('./ai-parser');\nconst { checkBudgetWarning } = require('./budget-checker');");
}

// 1. NLP Auto Insert
const targetAutoInsert = /return ctx\.telegram\.editMessageText\(ctx\.chat\.id, msg\.message_id, undefined,\s*`✅ \*Berhasil dicatat otomatis/i;
const replacementAutoInsert = `if (type === 'expense') {
          checkBudgetWarning(ctx, supabaseUserId, ctx.state.aiCategory, amount);
        }
        return ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, undefined, 
          \`✅ *Berhasil dicatat otomatis`;
code = code.replace(targetAutoInsert, replacementAutoInsert);

// 2. Action Insert
const targetAction = /await ctx\.editMessageText\(\s*`✅ \*Berhasil dicatat!\*\\n\\n\$\{typeStr\}/i;
const replacementAction = `if (pending.type === 'expense') {
        checkBudgetWarning(ctx, supabaseUserId, category, pending.amount);
      }
      await ctx.editMessageText(
        \`✅ *Berhasil dicatat!*\\n\\n\${typeStr}`;
code = code.replace(targetAction, replacementAction);

fs.writeFileSync('telegram-bot/bot.js', code);
console.log("Patched budget warning in bot.js");
