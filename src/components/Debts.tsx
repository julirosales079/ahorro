import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard, AlertTriangle } from 'lucide-react';
import { Debt } from '../types';
import { formatCurrency, calculateDebtPayoffTime } from '../utils/calculations';

interface DebtsProps {
  debts: Debt[];
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onUpdateDebt: (id: string, debt: Partial<Debt>) => void;
  onDeleteDebt: (id: string) => void;
  darkMode: boolean;
}

export const Debts: React.FC<DebtsProps> = ({
  debts,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  darkMode
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const [formData, setFormData] = useState({
    creditor: '',
    totalAmount: '',
    currentBalance: '',
    interestRate: '',
    monthlyPayment: '',
    startDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDebt) {
      onUpdateDebt(editingDebt.id, {
        creditor: formData.creditor,
        totalAmount: parseFloat(formData.totalAmount),
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate),
        monthlyPayment: parseFloat(formData.monthlyPayment),
        startDate: formData.startDate
      });
      setEditingDebt(null);
    } else {
      onAddDebt({
        creditor: formData.creditor,
        totalAmount: parseFloat(formData.totalAmount),
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: parseFloat(formData.interestRate),
        monthlyPayment: parseFloat(formData.monthlyPayment),
        startDate: formData.startDate
      });
    }
    
    setFormData({
      creditor: '',
      totalAmount: '',
      currentBalance: '',
      interestRate: '',
      monthlyPayment: '',
      startDate: ''
    });
    setShowForm(false);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      creditor: debt.creditor,
      totalAmount: debt.totalAmount.toString(),
      currentBalance: debt.currentBalance.toString(),
      interestRate: debt.interestRate.toString(),
      monthlyPayment: debt.monthlyPayment.toString(),
      startDate: debt.startDate
    });
    setShowForm(true);
  };

  const handlePayment = (debtId: string) => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0) {
      const debt = debts.find(d => d.id === debtId);
      if (debt) {
        const newBalance = Math.max(0, debt.currentBalance - amount);
        onUpdateDebt(debtId, {
          currentBalance: newBalance
        });
      }
    }
    setShowPayment(null);
    setPaymentAmount('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDebt(null);
    setFormData({
      creditor: '',
      totalAmount: '',
      currentBalance: '',
      interestRate: '',
      monthlyPayment: '',
      startDate: ''
    });
  };

  const getDebtStatus = (debt: Debt) => {
    const progressPercentage = ((debt.totalAmount - debt.currentBalance) / debt.totalAmount) * 100;
    if (progressPercentage >= 100) return 'paid';
    if (progressPercentage >= 75) return 'good';
    if (progressPercentage >= 50) return 'medium';
    return 'high';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagada';
      case 'good': return 'Buen progreso';
      case 'medium': return 'Progreso medio';
      case 'high': return 'Requiere atención';
      default: return 'Desconocido';
    }
  };

  const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Deudas
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Deuda total: {formatCurrency(totalDebt)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Deuda</span>
        </button>
      </div>

      {/* Debt Strategy Alert */}
      {debts.length > 1 && (
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} border ${darkMode ? 'border-yellow-700' : 'border-yellow-200'}`}>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
              Estrategia de Pago
            </h3>
          </div>
          <p className={`text-sm mt-2 ${darkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
            Considera usar la estrategia "Avalancha" (pagar primero las deudas con mayor interés) o "Bola de Nieve" (pagar primero las deudas más pequeñas).
          </p>
        </div>
      )}

      {/* Debt Form */}
      {showForm && (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingDebt ? 'Editar Deuda' : 'Nueva Deuda'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Acreedor
              </label>
              <input
                type="text"
                value={formData.creditor}
                onChange={(e) => setFormData({...formData, creditor: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Monto Total Original
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Saldo Actual
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentBalance}
                onChange={(e) => setFormData({...formData, currentBalance: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tasa de Interés Anual (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.interestRate}
                onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Pago Mensual
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.monthlyPayment}
                onChange={(e) => setFormData({...formData, monthlyPayment: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className={`px-4 py-2 rounded-md border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingDebt ? 'Actualizar' : 'Agregar Deuda'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Debts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {debts.map((debt) => {
          const status = getDebtStatus(debt);
          const payoffTime = calculateDebtPayoffTime(debt);
          const progressPercentage = ((debt.totalAmount - debt.currentBalance) / debt.totalAmount) * 100;
          
          return (
            <div key={debt.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <CreditCard className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {debt.creditor}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(debt)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteDebt(debt.id)}
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
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Saldo Actual
                    </p>
                    <p className={`font-semibold text-red-600`}>
                      {formatCurrency(debt.currentBalance)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Pago Mensual
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(debt.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Tasa de Interés
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {debt.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Tiempo Restante
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {payoffTime}
                    </p>
                  </div>
                </div>
                
                {showPayment === debt.id ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Monto del pago"
                      className={`flex-1 px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={() => handlePayment(debt.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setShowPayment(null)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPayment(debt.id)}
                    className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Registrar Pago
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {debts.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tienes deudas registradas</p>
          <p className="text-sm">Agrega una deuda para comenzar a gestionar tus pagos</p>
        </div>
      )}
    </div>
  );
};