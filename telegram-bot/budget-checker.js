const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fm = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

async function checkBudgetWarning(ctx, userId, category, amountJustAdded) {
  try {
    // 1. Get the budget for this category
    const { data: budgetData } = await supabase
      .from('budgets')
      .select('limit')
      .eq('user_id', userId)
      .ilike('category', category)
      .single();

    if (!budgetData || !budgetData.limit) return; // No budget set for this category
    const limit = budgetData.limit;

    // 2. Get total expenses for this category in the current month
    const now = new Date();
    const jkt = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const currentMonth = `${jkt.getFullYear()}-${String(jkt.getMonth() + 1).padStart(2, '0')}`;
    
    const { data: expenses } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .ilike('category', category);

    if (!expenses) return;

    // Filter to current month only
    const totalSpent = expenses
      .filter(e => e.date && e.date.startsWith(currentMonth))
      .reduce((acc, e) => acc + Number(e.amount), 0);

    // 3. Check thresholds
    const percentage = (totalSpent / limit) * 100;
    
    if (percentage >= 100) {
      await ctx.reply(`⚠️ *BUDGET WARNING*\n\nAnda telah melebihi budget bulanan untuk kategori *${category}*!\n\nLimit: ${fm(limit)}\nTerpakai: ${fm(totalSpent)} (${percentage.toFixed(0)}%)`, { parse_mode: 'Markdown' });
    } else if (percentage >= 80) {
      // Check if this transaction specifically pushed it over 80%
      const spentBefore = totalSpent - amountJustAdded;
      const percentageBefore = (spentBefore / limit) * 100;
      
      if (percentageBefore < 80) {
        await ctx.reply(`⚠️ *BUDGET ALERT*\n\nPengeluaran kategori *${category}* sudah mencapai ${percentage.toFixed(0)}% dari budget bulan ini.\n\nLimit: ${fm(limit)}\nTerpakai: ${fm(totalSpent)}`, { parse_mode: 'Markdown' });
      }
    }
  } catch (error) {
    console.error("Budget check error:", error);
  }
}

module.exports = { checkBudgetWarning };
