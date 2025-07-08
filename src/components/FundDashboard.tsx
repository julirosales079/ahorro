import React, { useState, useEffect } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';
import { Users, DollarSign, TrendingUp, Award, Calendar } from 'lucide-react';
import { User, SavingsEntry, FundSummary } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { formatCurrency } from '../utils/calculations';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

interface FundDashboardProps {
  darkMode: boolean;
}

export const FundDashboard: React.FC<FundDashboardProps> = ({ darkMode }) => {
  const [fundSummary, setFundSummary] = useState<FundSummary | null>(null);
  const [recentEntries, setRecentEntries] = useState<SavingsEntry[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const summary = savingsService.getFundSummary();
    setFundSummary(summary);

    const entries = savingsService.getAllSavings();
    const recent = entries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    setRecentEntries(recent);

    // Generate monthly data for the last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
      
      const monthTotal = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      months.push({
        month: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        total: monthTotal,
        count: monthEntries.length
      });
    }
    setMonthlyData(months);
  };

  if (!fundSummary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const users = authService.getAllUsersPublic().filter(u => u.role === 'member');
  const topSavers = users
    .sort((a, b) => b.totalSavings - a.totalSavings)
    .slice(0, 5);

  const savingsDistributionData = {
    labels: topSavers.map(user => user.name),
    datasets: [
      {
        data: topSavers.map(user => user.totalSavings),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Ahorros Mensuales',
        data: monthlyData.map(d => d.total),
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
        borderRadius: 8,
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
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#E5E7EB' : '#374151',
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total del Fondo
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(fundSummary.totalSavings)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Miembros Activos
              </p>
              <p className="text-2xl font-bold text-green-600">
                {fundSummary.activeMembers}
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                de {fundSummary.totalMembers} totales
              </p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ahorro Mensual
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(fundSummary.monthlyAverage)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Mayor Ahorrador
              </p>
              <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {fundSummary.topSaver?.name || 'N/A'}
              </p>
              {fundSummary.topSaver && (
                <p className="text-sm text-orange-600">
                  {formatCurrency(fundSummary.topSaver.totalSavings)}
                </p>
              )}
            </div>
            <Award className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Distribución de Ahorros
          </h3>
          <div className="h-64">
            {topSavers.length > 0 ? (
              <Doughnut 
                data={savingsDistributionData} 
                options={{ responsive: true, maintainAspectRatio: false }} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={`text-gray-500 ${darkMode ? 'text-gray-400' : ''}`}>
                  No hay datos de ahorros
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Evolución Mensual
          </h3>
          <div className="h-64">
            <Bar data={monthlyChartData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Recent Activity & Top Savers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {recentEntries.slice(0, 5).map(entry => {
              const user = users.find(u => u.id === entry.userId);
              return (
                <div key={entry.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">
                        {user?.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">
                    +{formatCurrency(entry.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Top Ahorradores
          </h3>
          <div className="space-y-3">
            {topSavers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {savingsService.getSavingsByUser(user.id).length} depósitos
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(user.totalSavings)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};