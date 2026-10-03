import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  getBudgetSummary, 
  classifyTransaction,
  getCashBalance,
  getTotalAssets,
  getTotalLiabilities,
  getNetWorth,
  getDebtToAssetRatio,
  getMonthlyIncome,
  getMonthlyExpense,
  getSavingsRate,
  getTradingBalanceAndGain
} from './calculations.js';

describe('calculations', () => {
  describe('Trading Logic', () => {
    it('invariant test: untuk periode dengan saldo awal 0, monthlySavings === perubahan cash balance', () => {
      const transactions = [
        { amount: 1000000, type: 'income', category: 'Salary', date: '2026-10-01' },
        { amount: 200000, type: 'expense', category: 'Food & Dining', date: '2026-10-05' },
        { amount: 300000, type: 'expense', category: 'Trading', date: '2026-10-10' }, // investment out
        { amount: 350000, type: 'income', category: 'Trading', date: '2026-10-25' } // return 300k + 50k gain
      ];
      
      const m = '2026-10';
      const mIncome = getMonthlyIncome(transactions, m); // 1000000 + 50000
      const mExpense = getMonthlyExpense(transactions, m); // 200000
      const mSavings = mIncome - mExpense; // 1050000 - 200000 = 850000
      
      const cashChange = getCashBalance(transactions); // 1000000 - 200000 - 300000 + 350000 = 850000
      
      expect(mSavings).toBe(cashChange);
      expect(mSavings).toBe(850000);
      expect(mIncome).toBe(1050000); // normal income + 50k gain
    });
    
    it('adds remaining investment balance to total assets', () => {
       const transactions = [
         { amount: 500000, type: 'expense', category: 'Trading', date: '2026-10-01' },
         { amount: 200000, type: 'income', category: 'Trading', date: '2026-10-10' }
       ];
       const cash = getCashBalance(transactions); // -500000 + 200000 = -300000
       const assets = [];
       const receivables = [];
       // Trading balance left = 300000. Total assets = -300000 (cash) + 300000 = 0.
       expect(getTotalAssets(cash, assets, receivables, transactions)).toBe(0);
       
       const { investmentAssets } = getTradingBalanceAndGain(transactions);
       expect(investmentAssets).toBe(300000);
    });
  });

  describe('classifyTransaction', () => {
    it('should classify normal income correctly', () => {
      expect(classifyTransaction({ type: 'income', category: 'Salary' })).toBe('income');
    });

    it('should classify Trading and Investasi as transfer/investment', () => {
      expect(classifyTransaction({ type: 'expense', category: 'Trading' })).toBe('transfer/investment');
      expect(classifyTransaction({ type: 'income', category: 'Trading' })).toBe('transfer/investment');
      expect(classifyTransaction({ type: 'expense', category: 'Investasi' })).toBe('transfer/investment');
    });

    it('should classify other expenses as expense', () => {
      expect(classifyTransaction({ type: 'expense', category: 'Food & Dining' })).toBe('expense');
      expect(classifyTransaction({ type: 'expense', category: 'Lainnya' })).toBe('expense');
    });
  });

});
