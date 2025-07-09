import React, { useState, useEffect } from 'react';
import { User, Eye, TrendingUp, DollarSign, Calendar, CreditCard, PiggyBank, Target, ArrowRight, ChevronRight } from 'lucide-react';
import { User as UserType, SavingsEntry, Loan } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { loanService } from '../utils/loanService';
import { formatCurrency } from '../utils/calculations';

interface UserDashboardProps {
  darkMode: boolean;
}

interface UserDetailModalProps {
  user: UserType;
  darkMode: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, darkMode, onClose }) => {
  const [activeTab, setActiveTab] = useState<'savings' | 'loans'>('savings');
  const userSavings = savingsService.getSavingsByUser(user.id);
  const userLoans = loanService.getLoansByUser(user.id);
  
  // Calculate savings statistics
  const totalSavings = userSavings.reduce((sum, entry) => sum + entry.amount, 0);
  const avgSavings = userSavings.length > 0 ? totalSavings / userSavings.length : 0;
  const lastSaving = userSavings[userSavings.length - 1];
  
  // Calculate loan statistics
  const activeLoans = userLoans.filter(loan => loan.status === 'active');
  const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOwed = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  
  // Monthly savings trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthSavings = userSavings.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });
    
    const monthTotal = monthSavings.reduce((sum, entry) => sum + entry.amount, 0);
    
    monthlyTrend.push({
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      total: monthTotal,
      count: monthSavings.length
    });
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    user.isActive ? 'bg-green-500 bg-opacity-20 text-green-100' : 'bg-red-500 bg-opacity-20 text-red-100'
                  }`}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-blue-100 text-sm">
                    Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Ahorrado
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
              <PiggyBank className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Depósitos
                </p>
                <p className="text-xl font-bold text-green-600">
                  {userSavings.length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border-l-4 border-purple-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Préstamos Activos
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {activeLoans.length}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} border-l-4 border-orange-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Saldo Pendiente
                </p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalOwed)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('savings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'savings'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              Plan de Ahorro
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              Préstamos
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'savings' && (
            <div className="space-y-6">
              {/* Savings Trend Chart */}
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tendencia de Ahorros (Últimos 6 meses)
                </h3>
                <div className="flex items-end space-x-2 h-32">
                  {monthlyTrend.map((month, index) => {
                    const maxAmount = Math.max(...monthlyTrend.map(m => m.total));
                    const height = maxAmount > 0 ? (month.total / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                          style={{ height: `${height}%`, minHeight: month.total > 0 ? '8px' : '2px' }}
                          title={`${month.month}: ${formatCurrency(month.total)}`}
                        ></div>
                        <span className={`text-xs mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {month.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Savings Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Promedio por Depósito
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(avgSavings)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Último Depósito
                  </h4>
                  <p className="text-lg font-semibold text-blue-600">
                    {lastSaving ? formatCurrency(lastSaving.amount) : 'N/A'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lastSaving ? new Date(lastSaving.date).toLocaleDateString() : 'Sin depósitos'}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Frecuencia
                  </h4>
                  <p className="text-lg font-semibold text-purple-600">
                    {userSavings.length > 0 ? `${userSavings.length} depósitos` : 'Sin actividad'}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Histórico total
                  </p>
                </div>
              </div>

              {/* Recent Savings */}
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Depósitos Recientes
                </h3>
                <div className="space-y-3">
                  {userSavings.slice(-5).reverse().map((entry) => (
                    <div key={entry.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'}`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {entry.description}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-green-600">
                        +{formatCurrency(entry.amount)}
                      </span>
                    </div>
                  ))}
                  {userSavings.length === 0 && (
                    <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No hay depósitos registrados
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              {/* Loan Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Total Prestado
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalBorrowed)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Saldo Pendiente
                  </h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalOwed)}
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                  <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Total Pagado
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalBorrowed - totalOwed)}
                  </p>
                </div>
              </div>

              {/* Loans List */}
              <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} border`}>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Historial de Préstamos
                </h3>
                <div className="space-y-4">
                  {userLoans.map((loan) => {
                    const progressPercentage = ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
                    
                    return (
                      <div key={loan.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-gray-50'} border-l-4 ${
                        loan.status === 'active' ? 'border-blue-500' : 
                        loan.status === 'paid' ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <CreditCard className={`h-5 w-5 ${
                              loan.status === 'active' ? 'text-blue-500' : 
                              loan.status === 'paid' ? 'text-green-500' : 'text-red-500'
                            }`} />
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                Préstamo de {formatCurrency(loan.amount)}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Iniciado el {new Date(loan.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            loan.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                            loan.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {loan.status === 'active' ? 'Activo' : 
                             loan.status === 'paid' ? 'Pagado' : 'En Mora'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuota Mensual</p>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatCurrency(loan.monthlyPayment)}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasa de Interés</p>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {loan.interestRate}%
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plazo</p>
                            <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {loan.termMonths} meses
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Saldo Pendiente</p>
                            <p className={`font-semibold ${loan.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {formatCurrency(loan.remainingBalance)}
                            </p>
                          </div>
                        </div>
                        
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
                      </div>
                    );
                  })}
                  {userLoans.length === 0 && (
                    <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No hay préstamos registrados
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const UserDashboard: React.FC<UserDashboardProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getAllUsersPublic().filter(u => u.role === 'member');
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && user.isActive) ||
                         (filter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const getUserStats = (user: UserType) => {
    const userSavings = savingsService.getSavingsByUser(user.id);
    const userLoans = loanService.getLoansByUser(user.id);
    const activeLoans = userLoans.filter(loan => loan.status === 'active');
    
    return {
      totalSavings: user.totalSavings,
      savingsCount: userSavings.length,
      activeLoans: activeLoans.length,
      totalOwed: activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0),
      lastActivity: userSavings.length > 0 ? userSavings[userSavings.length - 1].date : null
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard de Usuarios
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Vista detallada del plan de ahorro y préstamos de cada usuario
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <User className="h-6 w-6 text-blue-600" />
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {filteredUsers.length} usuarios
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Buscar Usuario
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Estado
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className={`w-full px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user);
          
          return (
            <div key={user.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
              user.isActive ? 'border-blue-500' : 'border-gray-400'
            } group cursor-pointer`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    user.isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-400'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                      {user.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <div className="flex items-center space-x-2">
                      <PiggyBank className="h-4 w-4 text-blue-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total Ahorrado
                      </span>
                    </div>
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      {formatCurrency(stats.totalSavings)}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Depósitos
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {stats.savingsCount}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Préstamos
                      </span>
                    </div>
                    <p className="text-lg font-bold text-purple-600 mt-1">
                      {stats.activeLoans}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-orange-50'}`}>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Debe
                      </span>
                    </div>
                    <p className="text-lg font-bold text-orange-600 mt-1">
                      {formatCurrency(stats.totalOwed)}
                    </p>
                  </div>
                </div>
                
                {stats.lastActivity && (
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-t`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Última actividad:
                      </span>
                      <span className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(stats.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedUser(user)}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg"
                >
                  <Eye size={16} />
                  <span>Ver Dashboard Completo</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredUsers.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No se encontraron usuarios</p>
          <p className="text-sm">Ajusta los filtros de búsqueda</p>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          darkMode={darkMode}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};