const { GoogleGenerativeAI } = require("@google/generative-ai");

async function parseWithAI(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are WealthPilot, a financial parsing assistant. The user will input text in Indonesian.
Your task is to determine the user's INTENT and return a strict JSON object.

There are TWO possible intents:
1. "record_transaction": The user wants to input or record money (expense, income, asset, debt, receivable).
2. "query_finance": The user is asking a question about their financial state, budget, balances, or chatting generally.

If intent is "record_transaction", include a 'data' object with:
- 'type': 'expense', 'income', 'asset', 'debt', 'receivable'.
- 'category' (for expense only): 'Food & Dining', 'Trading', 'Kebutuhan', 'Transportasi', 'Lainnya'.
- 'category' (for income only): 'Salary', 'Business', 'Bonus', 'Freelance', 'Investment', 'Gift', 'Other Income'.
- 'amount' as a pure number.
- 'note' as a short description.
- 'method' (e.g. BCA, Mandiri, Cash, Seabank. If not specified, leave empty).

If intent is "query_finance", include a 'data' object with:
- 'question': The user's exact question or message.

Examples:
- "Makan siang pakai BCA 50rb" -> {"intent":"record_transaction","data":{"type":"expense","amount":50000,"category":"Food & Dining","note":"Makan siang","method":"BCA"}}
- "Gaji bulan ini masuk 5 juta" -> {"intent":"record_transaction","data":{"type":"income","amount":5000000,"category":"Salary","note":"Gaji bulan ini","method":""}}
- "Berapa total hutang saya?" -> {"intent":"query_finance","data":{"question":"Berapa total hutang saya?"}}
- "Apakah bulan ini saya boros?" -> {"intent":"query_finance","data":{"question":"Apakah bulan ini saya boros?"}}

Input text: "${text}"

Return ONLY valid JSON without any markdown formatting or backticks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonStr = response.text().trim();
    
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    
    const parsed = JSON.parse(jsonStr.trim());
    
    // For backwards compatibility with bot.js (if we don't refactor everything immediately),
    // we return intent explicitly.
    return parsed;
  } catch (err) {
    console.error("AI Parse Error:", err);
    return null;
  }
}

async function answerFinancialQuery(question, summaryData) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return "Mohon maaf, saya belum dilengkapi dengan kunci AI (API Key) untuk menjawab.";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const fm = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);

    // Format summary nicely for the AI
    let contextStr = `Data Keuangan Pengguna Bulan ${summaryData.month}:\n`;
    contextStr += `- Saldo Rekening/Kas: ${fm(summaryData.totalAccountBalance)}\n`;
    contextStr += `- Total Aset: ${fm(summaryData.totalAssets)}\n`;
    contextStr += `- Total Hutang: ${fm(summaryData.totalDebts)}\n`;
    contextStr += `- Total Piutang: ${fm(summaryData.totalReceivables)}\n`;
    contextStr += `- Net Worth (Kekayaan Bersih): ${fm(summaryData.netWorth)}\n`;
    contextStr += `- Pemasukan Bulan Ini: ${fm(summaryData.incomeMonth)}\n`;
    contextStr += `- Pengeluaran Bulan Ini: ${fm(summaryData.expenseMonth)}\n`;
    contextStr += `- Sisa Cashflow Bulan Ini: ${fm(summaryData.cashflowMonth)}\n`;
    
    if (Object.keys(summaryData.categoryExpenses).length > 0) {
      contextStr += `- Rincian Pengeluaran:\n`;
      for (const [cat, amt] of Object.entries(summaryData.categoryExpenses)) {
        contextStr += `  * ${cat}: ${fm(amt)}\n`;
      }
    }

    const prompt = `Anda adalah WealthPilot Pro, asisten keuangan pribadi yang ramah, profesional, dan pintar.
Gunakan bahasa Indonesia yang santai tapi sopan (gunakan 'saya' untuk Anda, dan 'kamu' atau 'Anda' atau 'Kak' untuk pengguna).
Gunakan emoji yang relevan.

Berikut adalah data keuangan pengguna saat ini:
${contextStr}

Pertanyaan/Pesan pengguna: "${question}"

Tugas Anda:
Jawab pertanyaan pengguna berdasarkan data keuangan di atas. Jangan mengarang angka yang tidak ada.
Jika pengguna bertanya hal umum (misal: "halo"), balas dengan sapaan ramah dan tawarkan bantuan untuk mencatat keuangan atau mengecek saldo.
Jawab secara ringkas, padat, dan jelas.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err) {
    console.error("AI Answer Error:", err);
    return "Maaf, sistem AI sedang sibuk atau terjadi gangguan. Silakan coba lagi nanti.";
  }
}

module.exports = { parseWithAI, answerFinancialQuery };

