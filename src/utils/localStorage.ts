import { Transaction, SavingsGoal, Debt, Budget, Category, Settings } from '../types';
import { authService } from './auth';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finance-transactions',
  SAVINGS_GOALS: 'finance-savings-goals',
  DEBTS: 'finance-debts',
  BUDGETS: 'finance-budgets',
  CATEGORIES: 'finance-categories',
  SETTINGS: 'finance-settings'
};

// Get user-specific storage key
const getUserStorageKey = (baseKey: string): string => {
  const user = authService.getCurrentUser();
  return user ? authService.getUserStorageKey(baseKey, user.id) : baseKey;
};

export const storage = {
  // Transactions
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.TRANSACTIONS));
    return data ? JSON.parse(data) : [];
  },
  
  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(getUserStorageKey(STORAGE_KEYS.TRANSACTIONS), JSON.stringify(transactions));
  },
  
  addTransaction: (transaction: Transaction) => {
    const transactions = storage.getTransactions();
    transactions.push(transaction);
    storage.saveTransactions(transactions);
  },
  
  // Savings Goals
  getSavingsGoals: (): SavingsGoal[] => {
    const data = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.SAVINGS_GOALS));
    return data ? JSON.parse(data) : [];
  },
  
  saveSavingsGoals: (goals: SavingsGoal[]) => {
    localStorage.setItem(getUserStorageKey(STORAGE_KEYS.SAVINGS_GOALS), JSON.stringify(goals));
  },
  
  // Debts
  getDebts: (): Debt[] => {
    const data = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.DEBTS));
    return data ? JSON.parse(data) : [];
  },
  
  saveDebts: (debts: Debt[]) => {
    localStorage.setItem(getUserStorageKey(STORAGE_KEYS.DEBTS), JSON.stringify(debts));
  },
  
  // Budgets
  getBudgets: (): Budget[] => {
    const data = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.BUDGETS));
    return data ? JSON.parse(data) : [];
  },
  
  saveBudgets: (budgets: Budget[]) => {
    localStorage.setItem(getUserStorageKey(STORAGE_KEYS.BUDGETS), JSON.stringify(budgets));
  },
  
  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.CATEGORIES));
    if (data) return JSON.parse(data);
    
    // Default categories
    const defaultCategories: Category[] = [
      { id: '1', name: 'Salario', type: 'income', icon: 'DollarSign', color: '#10B981' },
      { id: '2', name: 'Freelance', type: 'income', icon: 'Briefcase', color: '#059669' },
      { id: '3', name: 'Inversiones', type: 'income', icon: 'TrendingUp', color: '#047857' },
      { id: '4', name: 'Alimentación', type: 'expense', icon: 'Coffee', color: '#EF4444' },
      { id: '5', name: 'Transporte', type: 'expense', icon: 'Car', color: '#DC2626' },
      { id: '6', name: 'Entretenimiento', type: 'expense', icon: 'Film', color: '#B91C1C' },
      { id: '7', name: 'Servicios', type: 'expense', icon: 'Zap', color: '#991B1B' },
      { id: '8', name: 'Salud', type: 'expense', icon: 'Heart', color: '#7F1D1D' },
      { id: '9', name: 'Educación', type: 'expense', icon: 'BookOpen', color: '#450A0A' }
    ];
    
    storage.saveCategories(defaultCategories);
    return defaultCategories;
  },
  
  saveCategories: (categories: Category[]) => {
    localStorage.setItem(getUserStorageKey(STORAGE_KEYS.CATEGORIES), JSON.stringify(categories));
  },
  
  // Settings
  getSettings: (): Settings => {
    const data = localStorage.getItem(getUserStorageKey(STORAGE_KEYS.SETTINGS));
    if (data) return JSON.parse(data);
    
    const defaultSettings: Settings = {
      currency: 'USD',
      darkMode: false,
      notifications: true,
      language: 'es'
    };
    
    storage.saveSettings(defaultSettings);
    return defaultSettings;
  },
  
  saveSettings: (settings: Settings) => {
    localStorage.setItem(getUserStorageKey(STORAGE_KEYS.SETTINGS), JSON.stringify(settings));
  }
};