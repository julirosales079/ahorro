import { Transaction, Debt, SavingsGoal } from '../types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const calculateMonthlyBalance = (transactions: Transaction[], date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  
  const monthlyTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });
  
  const income = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  return { income, expenses, balance: income - expenses };
};

export const calculateTotalBalance = (transactions: Transaction[]) => {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  return { income, expenses, balance: income - expenses };
};

export const calculateDebtPayoffTime = (debt: Debt) => {
  if (debt.monthlyPayment <= 0) return 'N/A';
  
  const monthlyInterestRate = debt.interestRate / 100 / 12;
  const balance = debt.currentBalance;
  const payment = debt.monthlyPayment;
  
  if (payment <= balance * monthlyInterestRate) {
    return 'Nunca (pago menor que intereses)';
  }
  
  const months = Math.ceil(
    Math.log(1 + (balance * monthlyInterestRate) / payment) / 
    Math.log(1 + monthlyInterestRate)
  );
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (years > 0) {
    return `${years} año${years > 1 ? 's' : ''} ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}`;
  }
  
  return `${months} mes${months > 1 ? 'es' : ''}`;
};

export const calculateSavingsProgress = (goal: SavingsGoal) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  return Math.min(progress, 100);
};

export const formatCurrency = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getCategoryTotals = (transactions: Transaction[]) => {
  const totals: { [key: string]: number } = {};
  
  transactions.forEach(transaction => {
    if (totals[transaction.category]) {
      totals[transaction.category] += transaction.amount;
    } else {
      totals[transaction.category] = transaction.amount;
    }
  });
  
  return totals;
};