import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, User, TrendingDown, AlertCircle, CheckCircle, Clock, Edit2, Trash2, Plus } from 'lucide-react';
import { Loan, User as UserType } from '../types';
import { loanService } from '../utils/loanService';
import { authService } from '../utils/auth';
import { formatCurrency } from '../utils/calculations';

interface LoanManagementProps {
  darkMode: boolean;
}

export const LoanManagement: React.FC<LoanManagementProps> = ({ darkMode }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState<{ show: boolean; loan: Loan | null }>({ show: false, loan: null });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paid' | 'defaulted'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allLoans = loanService.getAllLoans();
    const allUsers = authService.getAllUsersPublic();
    setLoans(allLoans);
    setUsers(allUsers);
  };

  const handleMakePayment = () => {
    if (!showPaymentModal.loan) return;

    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      const result = loanService.makePayment(showPaymentModal.loan.id, amount);
      if (result.success) {
        loadData();
        setShowPaymentModal({ show: false, loan: null });
        setPaymentAmount('');
      }
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
      const result = loanService.deleteLoan(loanId);
      if (result.success) {
        loadData();
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'paid': return 'Pagado';
      case 'defaulted': return 'En Mora';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'defaulted': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  const statistics = loanService.getLoanStatistics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Préstamos
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Administra todos los préstamos del fondo
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Préstamos
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.totalLoans}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Préstamos Activos
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {statistics.activeLoans}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Prestado
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(statistics.totalLent)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Saldo Pendiente
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(statistics.totalOutstanding)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filtrar por Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className={`px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="paid">Pagados</option>
              <option value="defaulted">En Mora</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loans List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLoans.map((loan) => {
          const user = users.find(u => u.id === loan.userId);
          const createdBy = users.find(u => u.id === loan.createdBy);
          const progressPercentage = ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
          
          return (
            <div key={loan.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 ${
              loan.status === 'active' ? 'border-blue-500' : 
              loan.status === 'paid' ? 'border-green-500' : 'border-red-500'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    loan.status === 'active' ? 'bg-blue-600' : 
                    loan.status === 'paid' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'Usuario no encontrado'}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user?.email}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {getStatusIcon(loan.status)}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(loan.status)}`}>
                        {getStatusText(loan.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowPaymentModal({ show: true, loan })}
                    disabled={loan.status !== 'active'}
                    className={`text-green-600 hover:text-green-900 transition-colors ${
                      loan.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <DollarSign size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLoan(loan.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Progreso de Pago
                    </span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        loan.status === 'paid' ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Capital por Cuota
                    </p>
                    <p className={`font-semibold text-green-600`}>
                      {formatCurrency(loan.amount / loan.termMonths)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatCurrency(loan.amount)} ÷ {loan.termMonths}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Interés por Cuota
                    </p>
                    <p className={`font-semibold text-orange-600`}>
                      {formatCurrency(loan.amount * (loan.interestRate / 100))}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatCurrency(loan.amount)} × {loan.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Cuota Mensual
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(loan.monthlyPayment)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Capital + Interés
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Capital + Interés
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Interés por Cuota
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(loan.amount * (loan.interestRate / 100))}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Tasa: {loan.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Capital por Cuota
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(loan.amount / loan.termMonths)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Monto ÷ {loan.termMonths}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Total a Pagar
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(loan.monthlyPayment * loan.termMonths)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {loan.termMonths} cuotas de {formatCurrency(loan.monthlyPayment)}
                    </p>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
                  <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    🔧 Cálculo Aplicado:
                  </h4>
                  <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                    <p>• Interés por cuota = {formatCurrency(loan.amount)} × {loan.interestRate}% = {formatCurrency(loan.amount * (loan.interestRate / 100))}</p>
                    <p>• Capital por cuota = {formatCurrency(loan.amount)} ÷ {loan.termMonths} = {formatCurrency(loan.amount / loan.termMonths)}</p>
                    <p>• Cuota Mensual = {formatCurrency(loan.amount / loan.termMonths)} + {formatCurrency(loan.amount * (loan.interestRate / 100))} = {formatCurrency(loan.monthlyPayment)}</p>
                    <p>• Total a Pagar = {formatCurrency(loan.monthlyPayment)} × {loan.termMonths} = {formatCurrency(loan.monthlyPayment * loan.termMonths)}</p>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Creado por: {createdBy?.name || 'Admin'} el {new Date(loan.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No hay préstamos {filter !== 'all' ? `con estado "${getStatusText(filter)}"` : 'registrados'}</p>
          <p className="text-sm">Los préstamos aparecerán aquí cuando se creen desde el análisis</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal.show && showPaymentModal.loan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Registrar Pago
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {users.find(u => u.id === showPaymentModal.loan?.userId)?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} mb-4`}>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Saldo Actual:</p>
                    <div className="flex justify-between text-xs mt-1">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Pagado: {formatCurrency(showPaymentModal.loan.amount - showPaymentModal.loan.remainingBalance)}
                      </span>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Inicio: {new Date(showPaymentModal.loan.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`font-semibold text-red-600`}>
                      {formatCurrency(showPaymentModal.loan.remainingBalance)}
                    </p>
                  </div>
                  <div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cuota Mensual:</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(showPaymentModal.loan.monthlyPayment)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Monto del Pago
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Ingresa el monto del pago"
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={() => setShowPaymentModal({ show: false, loan: null })}
                className={`px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={handleMakePayment}
                disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <DollarSign size={16} />
                <span>Registrar Pago</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};