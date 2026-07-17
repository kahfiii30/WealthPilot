const { GoogleGenerativeAI } = require("@google/generative-ai");

async function parseWithAI(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a financial parsing assistant. The user wants to record a financial transaction in Indonesian.
Extract the details into a strict JSON format. 

Allowed 'type': 'expense', 'income', 'asset', 'debt', 'receivable'.
Allowed 'category' (for expense only): 'Food & Dining', 'Trading', 'Kebutuhan', 'Transportasi', 'Lainnya'.
Allowed 'category' (for income only): 'Salary', 'Business', 'Bonus', 'Freelance', 'Investment', 'Gift', 'Other Income'.
Extract 'amount' as a pure number.
Extract 'note' as a short description.
Extract 'method' (if specified, e.g. BCA, Mandiri, Cash, Seabank. If not specified, leave empty).

Examples:
- "Makan siang pakai BCA 50rb" -> {"type":"expense","amount":50000,"category":"Food & Dining","note":"Makan siang","method":"BCA"}
- "Gaji bulan ini masuk 5 juta" -> {"type":"income","amount":5000000,"category":"Salary","note":"Gaji bulan ini","method":""}
- "Nambah saldo reksadana bibit 2jt" -> {"type":"asset","amount":2000000,"category":"","note":"Reksadana bibit","method":""}
- "Si budi ngutang 100k" -> {"type":"receivable","amount":100000,"category":"","note":"Budi","method":""}

Input text: "${text}"

Return ONLY valid JSON without any markdown formatting or backticks.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let jsonStr = response.text().trim();
    
    // Remove markdown code blocks if any
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.substring(7);
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.substring(3);
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
    
    return JSON.parse(jsonStr.trim());
  } catch (err) {
    console.error("AI Parse Error:", err);
    return null;
  }
}

module.exports = { parseWithAI };
