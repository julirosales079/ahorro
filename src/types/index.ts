export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  userId?: string; // Para transacciones específicas de usuario
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  creditor: string;
  totalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

export interface Settings {
  currency: string;
  darkMode: boolean;
  notifications: boolean;
  language: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  role: 'admin' | 'member';
  isActive: boolean;
  totalSavings: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface SavingsEntry {
  id: string;
  userId: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  createdBy: string; // ID del admin que registró el ahorro
}

export interface FundSummary {
  totalMembers: number;
  activeMembers: number;
  totalSavings: number;
  monthlyAverage: number;
  topSaver: User | null;
}