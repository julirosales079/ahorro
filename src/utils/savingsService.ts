import { SavingsEntry, User, FundSummary } from '../types';
import { authService } from './auth';

const SAVINGS_STORAGE_KEY = 'savings-fund-entries';

export const savingsService = {
  // Get all savings entries
  getAllSavings: (): SavingsEntry[] => {
    const data = localStorage.getItem(SAVINGS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Save all savings entries
  saveSavings: (entries: SavingsEntry[]) => {
    localStorage.setItem(SAVINGS_STORAGE_KEY, JSON.stringify(entries));
  },

  // Add savings entry
  addSavingsEntry: (userId: string, amount: number, description: string): { success: boolean; error?: string } => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Solo los administradores pueden registrar ahorros' };
    }

    const entries = savingsService.getAllSavings();
    const newEntry: SavingsEntry = {
      id: Date.now().toString(),
      userId,
      amount,
      date: new Date().toISOString().split('T')[0],
      description,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    entries.push(newEntry);
    savingsService.saveSavings(entries);

    // Update user's total savings
    savingsService.updateUserTotalSavings(userId);

    return { success: true };
  },

  // Get savings by user
  getSavingsByUser: (userId: string): SavingsEntry[] => {
    const entries = savingsService.getAllSavings();
    return entries.filter(entry => entry.userId === userId);
  },

  // Update user's total savings
  updateUserTotalSavings: (userId: string) => {
    const userSavings = savingsService.getSavingsByUser(userId);
    const total = userSavings.reduce((sum, entry) => sum + entry.amount, 0);
    
    authService.updateUser(userId, { totalSavings: total });
  },

  // Get fund summary
  getFundSummary: (): FundSummary => {
    const users = authService.getAllUsersPublic();
    const members = users.filter(user => user.role === 'member');
    const activeMembers = members.filter(user => user.isActive);
    const totalSavings = members.reduce((sum, user) => sum + user.totalSavings, 0);
    
    // Calculate monthly average (simplified)
    const entries = savingsService.getAllSavings();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    // Find top saver
    const topSaver = members.reduce((top, user) => 
      user.totalSavings > (top?.totalSavings || 0) ? user : top, null as User | null
    );

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalSavings,
      monthlyAverage: monthlyTotal,
      topSaver
    };
  },

  // Delete savings entry
  deleteSavingsEntry: (entryId: string): { success: boolean; error?: string } => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Solo los administradores pueden eliminar ahorros' };
    }

    const entries = savingsService.getAllSavings();
    const entryIndex = entries.findIndex(entry => entry.id === entryId);
    
    if (entryIndex === -1) {
      return { success: false, error: 'Entrada no encontrada' };
    }

    const entry = entries[entryIndex];
    entries.splice(entryIndex, 1);
    savingsService.saveSavings(entries);

    // Update user's total savings
    savingsService.updateUserTotalSavings(entry.userId);

    return { success: true };
  }
};