import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, UserCheck, UserX, DollarSign, Upload } from 'lucide-react';
import { User, SavingsEntry } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { formatCurrency } from '../utils/calculations';
import { excelService } from '../utils/excelService';

interface UserManagementProps {
  darkMode: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ darkMode }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSavingsForm, setShowSavingsForm] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsDescription, setSavingsDescription] = useState('');
  const [importMessage, setImportMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '123456',
    role: 'member' as 'admin' | 'member'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = authService.getAllUsersPublic();
    setUsers(allUsers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const result = authService.updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      
      if (result.success) {
        loadUsers();
        handleCancel();
      }
    } else {
      const result = authService.createUser(formData);
      
      if (result.success) {
        loadUsers();
        handleCancel();
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '123456',
      role: user.role
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '123456',
      role: 'member'
    });
  };

  const handleToggleActive = (userId: string, isActive: boolean) => {
    authService.updateUser(userId, { isActive: !isActive });
    loadUsers();
  };

  const handleAddSavings = (userId: string) => {
    const amount = parseFloat(savingsAmount);
    if (amount > 0) {
      const result = savingsService.addSavingsEntry(userId, amount, savingsDescription || 'Depósito de ahorro');
      
      if (result.success) {
        loadUsers();
        setShowSavingsForm(null);
        setSavingsAmount('');
        setSavingsDescription('');
      }
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await excelService.importFromCSV(file);
      setImportMessage(result.message);
      
      if (result.success) {
        loadUsers();
      }
    } catch (error) {
      setImportMessage('Error al importar el archivo');
    }

    // Reset file input
    event.target.value = '';
  };

  const members = users.filter(user => user.role === 'member');
  const activeMembers = members.filter(user => user.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Gestión de Usuarios
          </h2>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {members.length} miembros totales • {activeMembers.length} activos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Usuario</span>
          </button>
          <label className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <Upload size={20} />
            <span>Importar CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Import Message */}
      {importMessage && (
        <div className={`p-4 rounded-lg ${importMessage.includes('exitosamente') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {importMessage}
          <button
            onClick={() => setImportMessage('')}
            className="ml-2 text-sm underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* User Form */}
      {showForm && (
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nombre Completo
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
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                Rol
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'member'})}
                className={`w-full px-3 py-2 rounded-md border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="member">Miembro</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            
            {!editingUser && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Contraseña Inicial
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full px-3 py-2 rounded-md border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Contraseña por defecto: 123456"
                />
              </div>
            )}
            
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
                {editingUser ? 'Actualizar' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((user) => {
          const userSavings = savingsService.getSavingsByUser(user.id);
          const lastSaving = userSavings[userSavings.length - 1];
          
          return (
            <div key={user.id} className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    user.isActive ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {user.email}
                    </p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'} transition-colors`}
                  >
                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Total Ahorrado
                  </span>
                  <span className={`font-semibold text-green-600`}>
                    {formatCurrency(user.totalSavings)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Depósitos
                  </span>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userSavings.length}
                  </span>
                </div>
                
                {lastSaving && (
                  <div className="flex justify-between">
                    <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Último Depósito
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(lastSaving.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {showSavingsForm === user.id ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      step="0.01"
                      value={savingsAmount}
                      onChange={(e) => setSavingsAmount(e.target.value)}
                      placeholder="Monto a ahorrar"
                      className={`w-full px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <input
                      type="text"
                      value={savingsDescription}
                      onChange={(e) => setSavingsDescription(e.target.value)}
                      placeholder="Descripción (opcional)"
                      className={`w-full px-3 py-2 rounded-md border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddSavings(user.id)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setShowSavingsForm(null)}
                        className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSavingsForm(user.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={!user.isActive}
                  >
                    <DollarSign size={16} />
                    <span>Registrar Ahorro</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {members.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No hay miembros registrados</p>
          <p className="text-sm">Agrega el primer miembro para comenzar</p>
        </div>
      )}
    </div>
  );
};