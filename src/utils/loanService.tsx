import { Loan, User } from '../types';
import { authService } from './auth';

const LOANS_STORAGE_KEY = 'savings-fund-loans';

export const loanService = {
  // Get all loans
  getAllLoans: (): Loan[] => {
    const data = localStorage.getItem(LOANS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Save all loans
  saveLoans: (loans: Loan[]) => {
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
  },

  // Create new loan
  createLoan: (
    userId: string,
    amount: number,
    interestRate: number,
    termMonths: number
  ): { success: boolean; error?: string; loan?: Loan } => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Solo los administradores pueden crear préstamos' };
    }

    // 🔧 Nueva Fórmula Implementada:
    // 1. Cuota de capital fija = Monto del préstamo ÷ Número de meses
    const principalPayment = amount / termMonths;
    
    // 2. Interés por cuota = Monto del préstamo × Tasa de interés (en decimal)
    const interestRate_decimal = interestRate / 100;
    const interestPerPayment = amount * interestRate_decimal;
    
    // 3. Cuota total mensual = Cuota de capital + Interés por cuota
    const monthlyPayment = principalPayment + interestPerPayment;
    
    // 4. Total a pagar = Cuota mensual × Número de meses
    const totalPayment = monthlyPayment * termMonths;
    
    // 5. Total de intereses = Total a pagar - Monto del préstamo
    const totalInterest = totalPayment - amount;

    const loans = loanService.getAllLoans();
    const newLoan: Loan = {
      id: Date.now().toString(),
      userId,
      amount,
      interestRate,
      termMonths,
      monthlyPayment,
      remainingBalance: amount,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    loans.push(newLoan);
    loanService.saveLoans(loans);

    return { success: true, loan: newLoan };
  },

  // Get loans by user
  getLoansByUser: (userId: string): Loan[] => {
    const loans = loanService.getAllLoans();
    return loans.filter(loan => loan.userId === userId);
  },

  // Update loan
  updateLoan: (loanId: string, updates: Partial<Loan>): { success: boolean; error?: string } => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Solo los administradores pueden actualizar préstamos' };
    }

    const loans = loanService.getAllLoans();
    const loanIndex = loans.findIndex(loan => loan.id === loanId);

    if (loanIndex === -1) {
      return { success: false, error: 'Préstamo no encontrado' };
    }

    loans[loanIndex] = { ...loans[loanIndex], ...updates };
    loanService.saveLoans(loans);

    return { success: true };
  },

  // Make payment
  makePayment: (loanId: string, paymentAmount: number): { success: boolean; error?: string } => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Solo los administradores pueden registrar pagos' };
    }

    const loans = loanService.getAllLoans();
    const loanIndex = loans.findIndex(loan => loan.id === loanId);

    if (loanIndex === -1) {
      return { success: false, error: 'Préstamo no encontrado' };
    }

    const loan = loans[loanIndex];
    const newBalance = Math.max(0, loan.remainingBalance - paymentAmount);
    const status = newBalance === 0 ? 'paid' : loan.status;

    loans[loanIndex] = {
      ...loan,
      remainingBalance: newBalance,
      status
    };

    loanService.saveLoans(loans);

    return { success: true };
  },

  // Delete loan
  deleteLoan: (loanId: string): { success: boolean; error?: string } => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      return { success: false, error: 'Solo los administradores pueden eliminar préstamos' };
    }

    const loans = loanService.getAllLoans();
    const updatedLoans = loans.filter(loan => loan.id !== loanId);
    loanService.saveLoans(updatedLoans);

    return { success: true };
  },

  // Get loan statistics
  getLoanStatistics: () => {
    const loans = loanService.getAllLoans();
    const activeLoans = loans.filter(loan => loan.status === 'active');
    const totalLent = loans.reduce((sum, loan) => sum + loan.amount, 0);
    const totalOutstanding = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
    const totalPaid = totalLent - totalOutstanding;

    return {
      totalLoans: loans.length,
      activeLoans: activeLoans.length,
      totalLent,
      totalOutstanding,
      totalPaid,
      averageLoanAmount: loans.length > 0 ? totalLent / loans.length : 0
    };
  }
};