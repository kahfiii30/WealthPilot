const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getFinancialSummary(userId) {
  try {
    const d = new Date();
    const jakartaTime = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const year = jakartaTime.getFullYear();
    const month = String(jakartaTime.getMonth() + 1).padStart(2, "0");
    const lastDay = new Date(year, jakartaTime.getMonth() + 1, 0).getDate();
    
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, "0")}T23:59:59.999Z`;

    const [txResMonth, txResAll, assetRes, debtRes, recRes] = await Promise.all([
      supabase.from('transactions').select('amount, type, category').eq('user_id', userId).gte('date', startDate).lte('date', endDate),
      supabase.from('transactions').select('amount, type, method').eq('user_id', userId),
      supabase.from('assets').select('name, amount, asset_type, symbol, quantity').eq('user_id', userId),
      supabase.from('debts').select('name, amount').eq('user_id', userId),
      supabase.from('receivables').select('debtor_name, amount, paid_amount').eq('user_id', userId)
    ]);

    let incomeMonth = 0;
    let expenseMonth = 0;
    let categoryTotals = {};

    (txResMonth.data || []).forEach(t => {
      if (t.type === 'income') incomeMonth += Number(t.amount);
      if (t.type === 'expense') {
        expenseMonth += Number(t.amount);
        if (t.category) {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        }
      }
    });

    let methodBalances = {};
    (assetRes.data || []).forEach(a => {
      methodBalances[a.name.toUpperCase()] = Number(a.amount);
    });

    (txResAll.data || []).forEach(t => {
      let method = (t.method || '').trim();
      if (!method || method === '-' || method === '0' || method.toUpperCase() === 'BANK TRANSFER') {
        method = 'Cash';
      }
      const key = method.toUpperCase();
      if (methodBalances[key] === undefined) methodBalances[key] = 0;
      if (t.type === 'income') methodBalances[key] += Number(t.amount);
      if (t.type === 'expense') methodBalances[key] -= Number(t.amount);
    });

    let btcPrice = 0;
    try {
      const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr');
      const btcData = await btcRes.json();
      btcPrice = btcData.bitcoin.idr;
    } catch(e) {}

    let totalAssets = 0;
    let assetList = [];
    (assetRes.data || []).forEach(a => {
      let amount = Number(a.amount);
      if (a.asset_type === 'crypto' && a.symbol && a.quantity) {
        if (a.symbol.toLowerCase() === 'btc' || a.symbol.toLowerCase() === 'bitcoin') {
          amount = a.quantity * btcPrice;
        }
      }
      totalAssets += amount;
      assetList.push({ name: a.name, amount });
    });

    let totalDebts = 0;
    let debtList = [];
    (debtRes.data || []).forEach(d => {
      totalDebts += Number(d.amount);
      debtList.push({ name: d.name, amount: Number(d.amount) });
    });

    let totalReceivables = 0;
    let recList = [];
    (recRes.data || []).forEach(r => {
      let sisa = Number(r.amount) - Number(r.paid_amount);
      totalReceivables += sisa;
      recList.push({ name: r.debtor_name, amount: sisa });
    });

    let totalAccountBalance = 0;
    Object.entries(methodBalances).forEach(([key, amount]) => {
      const isAsset = (assetRes.data || []).some(a => a.name.toUpperCase() === key);
      if (!isAsset) {
        totalAccountBalance += amount;
      }
    });

    return {
      month: `${year}-${month}`,
      incomeMonth,
      expenseMonth,
      cashflowMonth: incomeMonth - expenseMonth,
      categoryExpenses: categoryTotals,
      totalAccountBalance,
      totalAssets,
      assetDetails: assetList,
      totalDebts,
      debtDetails: debtList,
      totalReceivables,
      receivableDetails: recList,
      netWorth: totalAccountBalance + totalAssets + totalReceivables - totalDebts
    };
  } catch (error) {
    console.error("Error generating financial summary:", error);
    return null;
  }
}

module.exports = { getFinancialSummary };
