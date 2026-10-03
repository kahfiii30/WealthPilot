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
  getLiquidityMonths
} from './calculations.js';

describe('calculations', () => {
  describe('classifyTransaction', () => {
    it('should classify income correctly', () => {
      expect(classifyTransaction({ type: 'income', category: 'Salary' })).toBe('income');
    });

    it('should classify Trading and Investasi as transfer/investment', () => {
      expect(classifyTransaction({ type: 'expense', category: 'Trading' })).toBe('transfer/investment');
      expect(classifyTransaction({ type: 'expense', category: 'Investasi' })).toBe('transfer/investment');
    });

    it('should classify other expenses as expense', () => {
      expect(classifyTransaction({ type: 'expense', category: 'Food & Dining' })).toBe('expense');
      expect(classifyTransaction({ type: 'expense', category: 'Lainnya' })).toBe('expense');
    });
  });

  describe('Phase 1 pure functions', () => {
    const transactions = [
      { amount: 1000, type: 'income', category: 'Salary', date: '2026-10-01' },
      { amount: 200, type: 'expense', category: 'Food', date: '2026-10-05' },
      { amount: 100, type: 'expense', category: 'Trading', date: '2026-10-10' } // transfer/investment
    ];
    const assets = [{ amount: 500 }];
    const receivables = [{ status: 'pending', remainingAmount: 300 }, { status: 'paid', remainingAmount: 100 }];
    const debts = [{ amount: 400 }];

    it('getCashBalance', () => {
      // 1000 - 200 - 100 = 700
      expect(getCashBalance(transactions)).toBe(700);
    });

    it('getTotalAssets', () => {
      const cash = 700;
      // 700 + 500 + 300 = 1500
      expect(getTotalAssets(cash, assets, receivables)).toBe(1500);
    });

    it('getTotalLiabilities', () => {
      expect(getTotalLiabilities(debts)).toBe(400);
    });

    it('getNetWorth', () => {
      expect(getNetWorth(1500, 400)).toBe(1100);
    });

    it('getMonthlyIncome & Expense', () => {
      expect(getMonthlyIncome(transactions, '2026-10')).toBe(1000);
      // trading is excluded from expense
      expect(getMonthlyExpense(transactions, '2026-10')).toBe(200); 
    });
  });

  describe('getBudgetSummary', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-10-15T10:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('handles (a) tanpa budget', () => {
      const transactions = [
        { amount: 100000, type: 'expense', category: 'Food & Dining', date: '2026-10-01' },
        { amount: 200000, type: 'expense', category: 'Lainnya', date: '2026-10-10' }
      ];
      const budgets = [];

      const result = getBudgetSummary(transactions, budgets, '2026-10');

      expect(result.totalBudget).toBe(0);
      expect(result.totalActual).toBe(300000);
      expect(result.remainingBudget).toBeNull();
      expect(result.safeToSpendPerDay).toBeNull();
      expect(result.consumedPercent).toBeNull();
      expect(result.categoryStats.length).toBe(2);
      expect(result.categoryStats[0].hasBudget).toBe(false);
    });
  });
});
