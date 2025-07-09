import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Download, User, TrendingUp, DollarSign, Calendar, CreditCard, PiggyBank, Target, BarChart3, PieChart, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import html2canvas from 'html2canvas';
import { User as UserType, SavingsEntry, Loan } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { loanService } from '../utils/loanService';
import { formatCurrency } from '../utils/calculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface UserDetailDashboardProps {
  userId: string;
  darkMode: boolean;
  onBack: () => void;
}

export const UserDetailDashboard: React.FC<UserDetailDashboardProps> = ({ userId, darkMode, onBack }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'savings' | 'loans'>('savings');
  const [isDownloading, setIsDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const foundUser = authService.getAllUsersPublic().find(u => u.id === userId);
    setUser(foundUser || null);
  }, [userId]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>Usuario no encontrado</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const userSavings = savingsService.getSavingsByUser(user.id);
  const userLoans = loanService.getLoansByUser(user.id);
  
  // Calculate savings statistics
  const totalSavings = userSavings.reduce((sum, entry) => sum + entry.amount, 0);
  const avgSavings = userSavings.length > 0 ? totalSavings / userSavings.length : 0;
  const lastSaving = userSavings[userSavings.length - 1];
  
  // Calculate loan statistics
  const activeLoans = userLoans.filter(loan => loan.status === 'active');
  const paidLoans = userLoans.filter(loan => loan.status === 'paid');
  const totalBorrowed = userLoans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOwed = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
  const totalPaid = totalBorrowed - totalOwed;
  
  // Monthly savings trend (last 12 months)
  const monthlyTrend = [];
  for (let i = 11; i >= 0; i--) {
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
      month: date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
      total: monthTotal,
      count: monthSavings.length
    });
  }

  // Chart configurations
  const savingsLineChartData = {
    labels: monthlyTrend.map(d => d.month),
    datasets: [
      {
        label: 'Ahorros Mensuales',
        data: monthlyTrend.map(d => d.total),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const savingsFrequencyData = {
    labels: monthlyTrend.map(d => d.month),
    datasets: [
      {
        label: 'Número de Depósitos',
        data: monthlyTrend.map(d => d.count),
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const loanStatusData = {
    labels: ['Préstamos Activos', 'Préstamos Pagados'],
    datasets: [
      {
        data: [activeLoans.length, paidLoans.length],
        backgroundColor: ['#F59E0B', '#10B981'],
        borderColor: ['#D97706', '#059669'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#E5E7EB' : '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        titleColor: darkMode ? '#FFFFFF' : '#000000',
        bodyColor: darkMode ? '#E5E7EB' : '#374151',
        borderColor: darkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#E5E7EB' : '#374151',
          callback: function(value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: darkMode ? '#374151' : '#E5E7EB',
        },
      },
      x: {
        ticks: {
          color: darkMode ? '#E5E7EB' : '#374151',
        },
        grid: {
          color: darkMode ? '#374151' : '#E5E7EB',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: darkMode ? '#E5E7EB' : '#374151',
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
        titleColor: darkMode ? '#FFFFFF' : '#000000',
        bodyColor: darkMode ? '#E5E7EB' : '#374151',
        borderColor: darkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
      },
    },
  };

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        height: dashboardRef.current.scrollHeight,
        width: dashboardRef.current.scrollWidth,
      });
      
      const link = document.createElement('a');
      link.download = `dashboard-${user.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error al generar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          } transition-colors`}
        >
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>
        
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isDownloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Download size={20} />
          <span>{isDownloading ? 'Generando...' : 'Descargar Dashboard'}</span>
        </button>
      </div>

      {/* Dashboard Content */}
      <div ref={dashboardRef} className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-8 rounded-xl`}>
        {/* User Header */}
        <div className={`p-8 rounded-xl mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white`}>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-blue-100 text-lg mb-3">{user.email}</p>
              <div className="flex items-center space-x-6">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  user.isActive ? 'bg-green-500 bg-opacity-20 text-green-100' : 'bg-red-500 bg-opacity-20 text-red-100'
                }`}>
                  {user.isActive ? 'Usuario Activo' : 'Usuario Inactivo'}
                </span>
                <span className="text-blue-100">
                  Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Generado el</p>
              <p className="text-white font-semibold">
                {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-blue-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Ahorrado
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalSavings)}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {userSavings.length} depósitos realizados
                </p>
              </div>
              <PiggyBank className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-green-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Promedio por Depósito
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(avgSavings)}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  Consistencia en ahorros
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-purple-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Préstamos Activos
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {activeLoans.length}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {paidLoans.length} préstamos pagados
                </p>
              </div>
              <CreditCard className="h-10 w-10 text-purple-600" />
            </div>
          </div>
          
          <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border-l-4 border-orange-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Saldo Pendiente
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalOwed)}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {formatCurrency(totalPaid)} ya pagado
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-8`}>
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('savings')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'savings'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              📊 Plan de Ahorro
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors ${
                activeTab === 'loans'
                  ? 'border-blue-500 text-blue-600'
                  : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              💳 Préstamos
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'savings' && (
          <div className="space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <BarChart3 className="h-6 w-6 mr-2 text-blue-600" />
                  Evolución de Ahorros (12 meses)
                </h3>
                <div className="h-80">
                  <Line data={savingsLineChartData} options={chartOptions} />
                </div>
              </div>

              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <Activity className="h-6 w-6 mr-2 text-green-600" />
                  Frecuencia de Depósitos
                </h3>
                <div className="h-80">
                  <Bar data={savingsFrequencyData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border`}>
                <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Estadísticas Generales
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total ahorrado:</span>
                    <span className={`font-bold text-blue-600`}>{formatCurrency(totalSavings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Número de depósitos:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userSavings.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Promedio por depósito:</span>
                    <span className={`font-bold text-green-600`}>{formatCurrency(avgSavings)}</span>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border`}>
                <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Último Depósito
                </h4>
                {lastSaving ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monto:</span>
                      <span className={`font-bold text-green-600`}>{formatCurrency(lastSaving.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fecha:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(lastSaving.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Descripción:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-sm`}>
                        {lastSaving.description}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay depósitos registrados
                  </p>
                )}
              </div>
              
              <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border`}>
                <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                  Análisis de Tendencia
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Mejor mes:</span>
                    <span className={`font-bold text-purple-600`}>
                      {monthlyTrend.length > 0 ? 
                        formatCurrency(Math.max(...monthlyTrend.map(m => m.total))) : 
                        formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Promedio mensual:</span>
                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(monthlyTrend.reduce((sum, m) => sum + m.total, 0) / 12)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Meses activos:</span>
                    <span className={`font-bold text-green-600`}>
                      {monthlyTrend.filter(m => m.total > 0).length}/12
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Savings */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <Clock className="h-6 w-6 mr-2 text-blue-600" />
                Historial de Depósitos Recientes
              </h3>
              <div className="space-y-4">
                {userSavings.slice(-10).reverse().map((entry, index) => (
                  <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-l-4 border-green-500`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {entry.description}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(entry.date).toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-green-600">
                        +{formatCurrency(entry.amount)}
                      </span>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Depósito #{userSavings.length - index}
                      </p>
                    </div>
                  </div>
                ))}
                {userSavings.length === 0 && (
                  <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No hay depósitos registrados para este usuario
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'loans' && (
          <div className="space-y-8">
            {/* Loan Summary and Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="grid grid-cols-1 gap-6">
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg border`}>
                  <h4 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Resumen Financiero
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total prestado:</span>
                      <span className={`font-bold text-blue-600`}>{formatCurrency(totalBorrowed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total pagado:</span>
                      <span className={`font-bold text-green-600`}>{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Saldo pendiente:</span>
                      <span className={`font-bold text-red-600`}>{formatCurrency(totalOwed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Préstamos totales:</span>
                      <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userLoans.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {userLoans.length > 0 && (
                <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <PieChart className="h-6 w-6 mr-2 text-purple-600" />
                    Estado de Préstamos
                  </h3>
                  <div className="h-64">
                    <Doughnut data={loanStatusData} options={doughnutOptions} />
                  </div>
                </div>
              )}
            </div>

            {/* Loans List */}
            <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
                Historial Detallado de Préstamos
              </h3>
              <div className="space-y-6">
                {userLoans.map((loan) => {
                  const progressPercentage = ((loan.amount - loan.remainingBalance) / loan.amount) * 100;
                  
                  return (
                    <div key={loan.id} className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-l-4 ${
                      loan.status === 'active' ? 'border-blue-500' : 
                      loan.status === 'paid' ? 'border-green-500' : 'border-red-500'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {loan.status === 'active' && <Clock className="h-6 w-6 text-blue-500" />}
                          {loan.status === 'paid' && <CheckCircle className="h-6 w-6 text-green-500" />}
                          {loan.status === 'defaulted' && <AlertCircle className="h-6 w-6 text-red-500" />}
                          <div>
                            <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              Préstamo de {formatCurrency(loan.amount)}
                            </p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Iniciado el {new Date(loan.startDate).toLocaleDateString('es-ES', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 text-sm font-medium rounded-full ${
                          loan.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                          loan.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {loan.status === 'active' ? 'Activo' : 
                           loan.status === 'paid' ? 'Pagado' : 'En Mora'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cuota Mensual</p>
                          <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(loan.monthlyPayment)}
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tasa de Interés</p>
                          <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {loan.interestRate}%
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plazo</p>
                          <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {loan.termMonths} meses
                          </p>
                        </div>
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Saldo Pendiente</p>
                          <p className={`font-bold text-lg ${loan.remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(loan.remainingBalance)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Progreso de Pago
                          </span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round(progressPercentage)}% completado
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
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
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      No hay préstamos registrados para este usuario
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Los préstamos aparecerán aquí cuando se otorguen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};