import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { TrendingUp, TrendingDown, DollarSign, Target, CreditCard } from 'lucide-react';
import { Transaction, SavingsGoal, Debt } from '../types';
import { calculateMonthlyBalance, calculateTotalBalance, formatCurrency, getCategoryTotals } from '../utils/calculations';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface DashboardProps {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  darkMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  savingsGoals,
  debts,
  darkMode
}) => {
  const currentMonth = new Date();
  const monthlyBalance = calculateMonthlyBalance(transactions, currentMonth);
  const totalBalance = calculateTotalBalance(transactions);
  
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalDebts = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
  
  const expensesByCategory = getCategoryTotals(
    transactions.filter(t => t.type === 'expense')
  );
  
  const incomesByCategory = getCategoryTotals(
    transactions.filter(t => t.type === 'income')
  );
  
  const expenseChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#EF4444',
          '#DC2626',
          '#B91C1C',
          '#991B1B',
          '#7F1D1D',
          '#450A0A',
        ],
        borderWidth: 0,
      },
    ],
  };
  
  const monthlyComparisonData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [
      {
        label: 'Monto',
        data: [monthlyBalance.income, monthlyBalance.expenses],
        backgroundColor: ['#10B981', '#EF4444'],
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
                Balance Total
              </p>
              <p className={`text-2xl font-bold ${totalBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(totalBalance.balance)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${totalBalance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ingresos del Mes
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyBalance.income)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Gastos del Mes
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyBalance.expenses)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ahorros Totales
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalSavings)}
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gastos por Categoría
          </h3>
          <div className="h-64">
            {Object.keys(expensesByCategory).length > 0 ? (
              <Doughnut data={expenseChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={`text-gray-500 ${darkMode ? 'text-gray-400' : ''}`}>
                  No hay datos de gastos
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Ingresos vs Gastos (Este Mes)
          </h3>
          <div className="h-64">
            <Bar data={monthlyComparisonData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Metas de Ahorro
          </h3>
          <div className="space-y-3">
            {savingsGoals.slice(0, 3).map(goal => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="flex items-center justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {goal.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className={`p-6 rounded-lg shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Deudas Principales
          </h3>
          <div className="space-y-3">
            {debts.slice(0, 3).map(debt => (
              <div key={debt.id} className="flex items-center justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {debt.creditor}
                </span>
                <span className="text-sm text-red-600 font-medium">
                  {formatCurrency(debt.currentBalance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};