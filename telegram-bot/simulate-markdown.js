require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

async function testMarkdown() {
  const typeStr = '🔴 Pengeluaran';
  const amountStr = 'Rp 25.000';
  const category = 'Food & Dining';
  const note = 'makan';
  const undoPrefix = 'tx';
  const dataId = '9d87d71a-b194-40be-aaa5-59a169da8a79';

  const text = `✅ *Berhasil dicatat!*\n\n${typeStr}: ${amountStr}\nKategori: ${category}\nKeterangan: ${note}`;
  
  try {
    console.log("Sending text:", text);
    // Use an actual chat id to test if Telegram accepts the markdown
    const chatId = process.env.ALLOWED_TELEGRAM_USER_ID;
    
    await bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([ Markup.button.callback('❌ Batalkan (Undo)', `undo_${undoPrefix}_${dataId}`) ])
    });
    console.log("Message sent successfully with Markdown!");
  } catch (error) {
    console.error("Markdown Error:", error);
  }
}

testMarkdown();
