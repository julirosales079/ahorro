import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Target, TrendingUp } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatCurrency, calculateSavingsProgress } from '../utils/calculations';

interface SavingsGoalsProps {
  savingsGoals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  onDeleteGoal: (id: string) => void;
  darkMode: boolean;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  savingsGoals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  darkMode
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showAddFunds, setShowAddFunds] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGoal) {
      onUpdateGoal(editingGoal.id, {
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: formData.deadline,
        description: formData.description
      });
      setEditingGoal(null);
    } else {
      onAddGoal({
        name: formData.name,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount),
        deadline: formData.deadline,
        description: formData.description
      });
    }
    
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      description: ''
    });
    setShowForm(false);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      description: goal.description
    });
    setShowForm(true);
  };

  const handleAddFunds = (goalId: string) => {
    const amount = parseFloat(addFundsAmount);
    if (amount > 0) {
      const goal = savingsGoals.find(g => g.id === goalId);
      if (goal) {
        onUpdateGoal(goalId, {
          currentAmount: goal.currentAmount + amount
        });
      }
    }
    setShowAddFunds(null);
    setAddFundsAmount('');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      description: ''
    });
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Metas de Ahorro
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nueva Meta</span>
        </button>
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingGoal ? 'Editar Meta' : 'Nueva Meta de Ahorro'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre de la Meta
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                Monto Objetivo
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
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
                Monto Actual
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({...formData, currentAmount: e.target.value})}
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
                Fecha Límite
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
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
                {editingGoal ? 'Actualizar' : 'Crear Meta'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const progress = calculateSavingsProgress(goal);
          const daysRemaining = getDaysRemaining(goal.deadline);
          
          return (
            <div key={goal.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {goal.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {daysRemaining > 0 ? `${daysRemaining} días restantes` : 'Vencida'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
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
                      Progreso
                    </span>
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Actual
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(goal.currentAmount)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Objetivo
                    </p>
                    <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                </div>
                
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {goal.description}
                </p>
                
                {showAddFunds === goal.id ? (
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={addFundsAmount}
                      onChange={(e) => setAddFundsAmount(e.target.value)}
                      placeholder="Monto a agregar"
                      className={`flex-1 px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button
                      onClick={() => handleAddFunds(goal.id)}
                      className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setShowAddFunds(null)}
                      className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddFunds(goal.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    <TrendingUp size={16} />
                    <span>Agregar Fondos</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {savingsGoals.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No tienes metas de ahorro</p>
          <p className="text-sm">Crea tu primera meta para comenzar a ahorrar</p>
        </div>
      )}
    </div>
  );
};