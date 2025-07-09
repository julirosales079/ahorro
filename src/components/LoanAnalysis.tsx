import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp, Users, FileText, Plus, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { User, LoanAnalysis as LoanAnalysisType } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { loanService } from '../utils/loanService';
import { formatCurrency } from '../utils/calculations';

interface LoanAnalysisProps {
  darkMode: boolean;
}

export const LoanAnalysis: React.FC<LoanAnalysisProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const [interestRate, setInterestRate] = useState('15');
  const [termMonths, setTermMonths] = useState('12');
  const [loanPercentage, setLoanPercentage] = useState('80');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getAllUsersPublic().filter(u => u.role === 'member' && u.isActive);
    setUsers(allUsers);
  };

  const calculateLoanAnalysis = (user: User) => {
    const savings = user.totalSavings;
    const maxLoanAmount = (savings * parseFloat(loanPercentage)) / 100;
    const monthlyInterestRate = parseFloat(interestRate) / 100 / 12;
    const months = parseInt(termMonths);
    
    // Calculate monthly payment using loan formula
    const monthlyPayment = maxLoanAmount * 
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / 
      (Math.pow(1 + monthlyInterestRate, months) - 1);
    
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - maxLoanAmount;
    
    return {
      maxLoanAmount,
      monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
      totalPayment: isNaN(totalPayment) ? maxLoanAmount : totalPayment,
      totalInterest: isNaN(totalInterest) ? 0 : totalInterest,
      interestRate: parseFloat(interestRate),
      termMonths: months,
      loanPercentage: parseFloat(loanPercentage)
    };
  };

  const handleAnalyzeUser = (user: User) => {
    setSelectedUser(user);
    const analysis = calculateLoanAnalysis(user);
    setAnalysisResults(analysis);
    setShowAnalysisForm(true);
  };

  const handleCreateLoan = async () => {
    if (!selectedUser || !analysisResults) return;

    try {
      const result = loanService.createLoan(
        selectedUser.id,
        analysisResults.maxLoanAmount,
        analysisResults.interestRate,
        analysisResults.termMonths
      );

      if (result.success) {
        setShowConfirmationModal(false);
        setShowAnalysisForm(false);
        setSelectedUser(null);
        setAnalysisResults(null);
        
        // Show success message in the app
        setSuccessMessage(`✅ Préstamo creado exitosamente para ${selectedUser.name}. 
        
📋 Detalles del préstamo:
💰 Monto: ${formatCurrency(analysisResults.maxLoanAmount)}
📊 Tasa de interés: ${analysisResults.interestRate}%
📅 Plazo: ${analysisResults.termMonths} meses
💳 Cuota mensual: ${formatCurrency(analysisResults.monthlyPayment)}

El préstamo está disponible en la sección "Gestión de Préstamos" donde podrás registrar los pagos.`);
        
        // Clear message after 10 seconds
        setTimeout(() => setSuccessMessage(''), 10000);
      } else {
        alert('Error al crear el préstamo: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Error inesperado al crear el préstamo');
    }
  };

  const getRiskLevel = (savings: number) => {
    if (savings >= 1000000) return { level: 'Bajo', color: 'text-green-600', bg: 'bg-green-100' };
    if (savings >= 500000) return { level: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (savings >= 100000) return { level: 'Alto', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Muy Alto', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getRecommendedLoanPercentage = (savings: number) => {
    if (savings >= 1000000) return 90;
    if (savings >= 500000) return 80;
    if (savings >= 100000) return 70;
    return 50;
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className={`font-semibold text-green-600 mb-2`}>
                Préstamo Creado Exitosamente
              </h3>
              <div className={`text-sm ${darkMode ? 'text-green-200' : 'text-green-800'} whitespace-pre-line`}>
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
              >
                Cerrar mensaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Préstamos
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Analiza la capacidad de préstamo de cada usuario basado en sus ahorros
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* Global Settings */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Configuración Global de Préstamos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Tasa de Interés (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Tasa de interés total para el préstamo
            </p>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Plazo (Meses)
            </label>
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="18">18 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              % del Ahorro Prestable
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={loanPercentage}
              onChange={(e) => setLoanPercentage(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
      </div>

      {/* Users Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const userSavings = savingsService.getSavingsByUser(user.id);
          const lastSaving = userSavings[userSavings.length - 1];
          const risk = getRiskLevel(user.totalSavings);
          const recommendedPercentage = getRecommendedLoanPercentage(user.totalSavings);
          const quickAnalysis = calculateLoanAnalysis(user);
          
          return (
            <div key={user.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-blue-500`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${risk.bg} ${risk.color}`}>
                  Riesgo {risk.level}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Total Ahorrado
                    </p>
                    <p className={`font-semibold text-green-600`}>
                      {formatCurrency(user.totalSavings)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Depósitos
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userSavings.length}
                    </p>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Análisis Rápido
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Préstamo máximo:</span>
                      <span className={`font-medium text-blue-600`}>
                        {formatCurrency(quickAnalysis.maxLoanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Cuota mensual:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(quickAnalysis.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>% Recomendado:</span>
                      <span className={`font-medium text-orange-600`}>
                        {recommendedPercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {lastSaving && (
                  <div className="flex justify-between text-sm">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Último depósito:
                    </span>
                    <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(lastSaving.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={() => handleAnalyzeUser(user)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Eye size={16} />
                  <span>Análisis Detallado</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis Modal */}
      {showAnalysisForm && selectedUser && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Análisis Detallado de Préstamo
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedUser.name} - {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setShowAnalysisForm(false)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* User Info Summary */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Información del Usuario
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Ahorrado</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedUser.totalSavings)}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Depósitos</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {savingsService.getSavingsByUser(selectedUser.id).length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nivel de Riesgo</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevel(selectedUser.totalSavings).bg} ${getRiskLevel(selectedUser.totalSavings).color}`}>
                      {getRiskLevel(selectedUser.totalSavings).level}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>% Recomendado</p>
                    <p className="font-semibold text-orange-600">
                      {getRecommendedLoanPercentage(selectedUser.totalSavings)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Loan Parameters */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Parámetros del Préstamo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tasa de Interés (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => {
                        setInterestRate(e.target.value);
                        setAnalysisResults(calculateLoanAnalysis(selectedUser));
                      }}
                      className={`w-full px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plazo (Meses)
                    </label>
                    <select
                      value={termMonths}
                      onChange={(e) => {
                        setTermMonths(e.target.value);
                        setAnalysisResults(calculateLoanAnalysis(selectedUser));
                      }}
                      className={`w-full px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="6">6 meses</option>
                      <option value="12">12 meses</option>
                      <option value="18">18 meses</option>
                      <option value="24">24 meses</option>
                      <option value="36">36 meses</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      % del Ahorro Prestable
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={loanPercentage}
                      onChange={(e) => {
                        setLoanPercentage(e.target.value);
                        setAnalysisResults(calculateLoanAnalysis(selectedUser));
                      }}
                      className={`w-full px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`}>
                  <h4 className={`font-semibold mb-3 text-blue-600`}>
                    Resultados del Análisis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monto máximo del préstamo:</span>
                      <span className={`font-bold text-blue-600`}>
                        {formatCurrency(analysisResults.maxLoanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cuota mensual:</span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analysisResults.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total a pagar:</span>
                      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analysisResults.totalPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total de intereses:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(analysisResults.totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-l-4 border-green-500 ${darkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                  <h4 className={`font-semibold mb-3 text-green-600`}>
                    Recomendaciones
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Capacidad de Pago
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {analysisResults.monthlyPayment <= selectedUser.totalSavings * 0.1 
                          ? '✅ Excelente capacidad de pago' 
                          : analysisResults.monthlyPayment <= selectedUser.totalSavings * 0.2
                          ? '⚠️ Capacidad de pago moderada'
                          : '❌ Capacidad de pago limitada'
                        }
                      </p>
                    </div>
                    <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Rentabilidad
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Ganancia de {formatCurrency(analysisResults.totalInterest)} en {termMonths} meses
                      </p>
                    </div>
                    <div className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Porcentaje Sugerido
                      </p>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {getRecommendedLoanPercentage(selectedUser.totalSavings)}% del ahorro total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={() => setShowAnalysisForm(false)}
                className={`px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cerrar
              </button>
              <button
                onClick={() => setShowConfirmationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Crear Préstamo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && selectedUser && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Confirmar Creación de Préstamo
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Revisa los detalles antes de crear el préstamo
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <h4 className={`font-semibold mb-3 text-blue-600 flex items-center`}>
                  👤 Información del Beneficiario
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nombre:</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedUser.name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email:</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Ahorrado:</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(selectedUser.totalSavings)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nivel de Riesgo:</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevel(selectedUser.totalSavings).bg} ${getRiskLevel(selectedUser.totalSavings).color}`}>
                      {getRiskLevel(selectedUser.totalSavings).level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'} border ${darkMode ? 'border-green-800' : 'border-green-200'}`}>
                <h4 className={`font-semibold mb-3 text-green-600 flex items-center`}>
                  💰 Detalles del Préstamo
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monto del Préstamo:</p>
                    <p className="font-bold text-green-600 text-lg">
                      {formatCurrency(analysisResults.maxLoanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Tasa de Interés:</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {analysisResults.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plazo:</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {analysisResults.termMonths} meses
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cuota Mensual:</p>
                    <p className="font-bold text-blue-600 text-lg">
                      {formatCurrency(analysisResults.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total a Pagar:</p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(analysisResults.totalPayment)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total de Intereses:</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(analysisResults.totalInterest)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <h4 className={`font-semibold mb-3 text-yellow-600 flex items-center`}>
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Información Importante
                </h4>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-start space-x-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>El préstamo se creará inmediatamente y estará disponible en "Gestión de Préstamos"</span>
                  </div>
                  <div className={`flex items-start space-x-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>Podrás registrar pagos desde la sección de gestión de préstamos</span>
                  </div>
                  <div className={`flex items-start space-x-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>El usuario debe ser informado sobre las condiciones del préstamo</span>
                  </div>
                  <div className={`flex items-start space-x-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>Se recomienda establecer fechas de vencimiento para cada cuota</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className={`px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateLoan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Confirmar y Crear Préstamo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No hay usuarios activos para analizar</p>
          <p className="text-sm">Los usuarios deben tener ahorros registrados para poder analizar préstamos</p>
        </div>
      )}
    </div>
  );
};