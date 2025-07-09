import React, { useState, useEffect } from 'react';
import { User, Eye, TrendingUp, DollarSign, Calendar, CreditCard, PiggyBank, Target, ArrowRight, ChevronRight, Search, Filter } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { loanService } from '../utils/loanService';
import { formatCurrency } from '../utils/calculations';

interface UserDashboardPageProps {
  darkMode: boolean;
  onUserSelect: (userId: string) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ darkMode, onUserSelect }) => {
  const [users, setUsers] = useState<UserType[]>([]);
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

  // Calculate overall statistics
  const overallStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalSavings: users.reduce((sum, user) => sum + user.totalSavings, 0),
    totalLoans: users.reduce((sum, user) => {
      const userLoans = loanService.getLoansByUser(user.id);
      return sum + userLoans.filter(loan => loan.status === 'active').length;
    }, 0)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white mb-4`}>
          <User className="h-8 w-8" />
        </div>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
          Dashboard de Usuarios
        </h1>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
          Explora el plan de ahorro y préstamos de cada usuario con análisis detallados y visualizaciones interactivas
        </p>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Usuarios
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {overallStats.totalUsers}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                {overallStats.activeUsers} activos
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-green-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total Ahorrado
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(overallStats.totalSavings)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Fondo colectivo
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-purple-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Préstamos Activos
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {overallStats.totalLoans}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                En curso
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-orange-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Promedio por Usuario
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(overallStats.totalUsers > 0 ? overallStats.totalSavings / overallStats.totalUsers : 0)}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                Ahorro promedio
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center space-x-4 mb-4">
          <Filter className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Filtros de Búsqueda
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Buscar Usuario
            </label>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Estado del Usuario
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
            >
              <option value="all">Todos los usuarios</option>
              <option value="active">Solo usuarios activos</option>
              <option value="inactive">Solo usuarios inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user);
          
          return (
            <div key={user.id} className={`group relative p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 ${
              user.isActive ? 'border-blue-500 hover:border-blue-400' : 'border-gray-400'
            } transform hover:-translate-y-1`}>
              {/* User Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                    user.isActive ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-400'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-blue-600 transition-colors`}>
                      {user.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {stats.lastActivity && (
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Últ. actividad: {new Date(stats.lastActivity).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <PiggyBank className="h-4 w-4 text-blue-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Total Ahorrado
                      </span>
                    </div>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(stats.totalSavings)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      {stats.savingsCount} depósitos
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'} border border-green-200`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Promedio
                      </span>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(stats.savingsCount > 0 ? stats.totalSavings / stats.savingsCount : 0)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      por depósito
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} border border-purple-200`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Préstamos
                      </span>
                    </div>
                    <p className="text-xl font-bold text-purple-600">
                      {stats.activeLoans}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      activos
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-orange-50'} border border-orange-200`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-orange-600" />
                      <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Debe
                      </span>
                    </div>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(stats.totalOwed)}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                      pendiente
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Button */}
              <button
                onClick={() => onUserSelect(user.id)}
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg transform group-hover:scale-105 font-medium"
              >
                <Eye size={18} />
                <span>Ver Dashboard Completo</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className={`text-center py-16 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
            No se encontraron usuarios
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            Ajusta los filtros de búsqueda para encontrar usuarios específicos
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilter('all');
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      )}
    </div>
  );
};