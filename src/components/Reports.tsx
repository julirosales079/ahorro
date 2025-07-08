import React, { useState } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { User, SavingsEntry } from '../types';
import { authService } from '../utils/auth';
import { savingsService } from '../utils/savingsService';
import { excelService } from '../utils/excelService';
import { formatCurrency } from '../utils/calculations';

interface ReportsProps {
  darkMode: boolean;
}

export const Reports: React.FC<ReportsProps> = ({ darkMode }) => {
  const [importMessage, setImportMessage] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const users = authService.getAllUsersPublic().filter(u => u.role === 'member');
  const allSavings = savingsService.getAllSavings();
  const totalFund = users.reduce((sum, user) => sum + user.totalSavings, 0);

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await excelService.importFromCSV(file);
      setImportMessage(result.message);
    } catch (error) {
      setImportMessage('Error al importar el archivo');
    }

    event.target.value = '';
  };

  const getFilteredSavings = () => {
    if (selectedPeriod === 'all') return allSavings;

    const now = new Date();
    const filterDate = new Date();

    switch (selectedPeriod) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return allSavings;
    }

    return allSavings.filter(entry => new Date(entry.date) >= filterDate);
  };

  const filteredSavings = getFilteredSavings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Reportes del Fondo
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={excelService.exportToCSV}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} />
            <span>Exportar Usuarios</span>
          </button>
          <button
            onClick={excelService.exportSavingsEntries}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText size={16} />
            <span>Exportar Movimientos</span>
          </button>
          <label className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <Upload size={16} />
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

      {/* Controls */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Período
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className={`px-3 py-2 rounded-md border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">Todos los tiempos</option>
              <option value="month">Último mes</option>
              <option value="quarter">Últimos 3 meses</option>
              <option value="year">Último año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total del Fondo</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalFund)}</p>
        </div>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Miembros Activos</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Depósitos en Período</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">{filteredSavings.length}</p>
        </div>
        <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monto en Período</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {formatCurrency(filteredSavings.reduce((sum, entry) => sum + entry.amount, 0))}
          </p>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Resumen por Usuario</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Usuario</th>
                <th className={`text-right py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Ahorrado</th>
                <th className={`text-right py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Depósitos</th>
                <th className={`text-right py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Último Depósito</th>
                <th className={`text-center py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const userSavings = savingsService.getSavingsByUser(user.id);
                const lastSaving = userSavings[userSavings.length - 1];
                return (
                  <tr key={user.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                      </div>
                    </td>
                    <td className="py-2 text-right text-blue-600 font-semibold">
                      {formatCurrency(user.totalSavings)}
                    </td>
                    <td className={`py-2 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {userSavings.length}
                    </td>
                    <td className={`py-2 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {lastSaving ? new Date(lastSaving.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Movements */}
      <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Movimientos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Fecha</th>
                <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Usuario</th>
                <th className={`text-right py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monto</th>
                <th className={`text-left py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {filteredSavings.slice(0, 20).map((entry) => {
                const user = users.find(u => u.id === entry.userId);
                return (
                  <tr key={entry.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className={`py-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name || 'Usuario no encontrado'}
                    </td>
                    <td className="py-2 text-right text-green-600 font-semibold">
                      +{formatCurrency(entry.amount)}
                    </td>
                    <td className={`py-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {entry.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
