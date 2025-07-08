import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, DollarSign, Bell, Download, User } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import { authService } from '../utils/auth';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (settings: Partial<SettingsType>) => void;
  darkMode: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  darkMode
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const currentUser = authService.getCurrentUser();

  const currencies = [
    { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
    { code: 'COP', name: 'Peso colombiano', symbol: '$' },
    { code: 'ARS', name: 'Peso argentino', symbol: '$' },
    { code: 'CLP', name: 'Peso chileno', symbol: '$' },
    { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
  ];

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];

  const handleExportData = () => {
    const allData = {
      user: currentUser,
      transactions: JSON.parse(localStorage.getItem('finance-transactions') || '[]'),
      savingsGoals: JSON.parse(localStorage.getItem('finance-savings-goals') || '[]'),
      debts: JSON.parse(localStorage.getItem('finance-debts') || '[]'),
      budgets: JSON.parse(localStorage.getItem('finance-budgets') || '[]'),
      categories: JSON.parse(localStorage.getItem('finance-categories') || '[]'),
      settings: JSON.parse(localStorage.getItem('finance-settings') || '{}'),
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `finance-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate and import data
        if (importedData.transactions) {
          localStorage.setItem('finance-transactions', JSON.stringify(importedData.transactions));
        }
        if (importedData.savingsGoals) {
          localStorage.setItem('finance-savings-goals', JSON.stringify(importedData.savingsGoals));
        }
        if (importedData.debts) {
          localStorage.setItem('finance-debts', JSON.stringify(importedData.debts));
        }
        if (importedData.budgets) {
          localStorage.setItem('finance-budgets', JSON.stringify(importedData.budgets));
        }
        if (importedData.categories) {
          localStorage.setItem('finance-categories', JSON.stringify(importedData.categories));
        }
        if (importedData.settings) {
          localStorage.setItem('finance-settings', JSON.stringify(importedData.settings));
        }
        
        alert('Datos importados exitosamente. Recarga la página para ver los cambios.');
      } catch (error) {
        alert('Error al importar los datos. Verifica que el archivo sea válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que deseas borrar todos los datos? Esta acción no se puede deshacer.')) {
      localStorage.clear();
      alert('Todos los datos han sido borrados. Recarga la página.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className={`h-8 w-8 ${darkMode ? 'text-white' : 'text-gray-900'}`} />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Configuración
        </h2>
      </div>

      {/* Tabs */}
      <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent ${darkMode ? 'text-gray-300 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Datos
          </button>
        </nav>
      </div>

      {/* Profile Settings */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Información del Perfil
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {currentUser?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser?.name}
                  </h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentUser?.email}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Miembro desde {currentUser ? new Date(currentUser.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Appearance */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Apariencia
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Modo Oscuro
                    </label>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Activa el tema oscuro para una mejor experiencia nocturna
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Moneda
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5" />
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Moneda Predeterminada
                  </label>
                  <select
                    value={settings.currency}
                    onChange={(e) => onUpdateSettings({ currency: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Idioma
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5" />
                <div className="flex-1">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Idioma de la Aplicación
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => onUpdateSettings({ language: e.target.value })}
                    className={`w-full px-3 py-2 rounded-md border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    {languages.map(language => (
                      <option key={language.code} value={language.code}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notificaciones
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Notificaciones Push
                    </label>
                    <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Recibe alertas sobre metas y presupuestos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ notifications: !settings.notifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Backup & Restore */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Respaldo y Restauración
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Exportar Datos
                </h4>
                <p className={`text-xs mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Descarga todos tus datos financieros como archivo de respaldo
                </p>
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Exportar Datos</span>
                </button>
              </div>
              
              <div>
                <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Importar Datos
                </h4>
                <p className={`text-xs mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Restaura tus datos desde un archivo de respaldo
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className={`block w-full text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  } file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
                />
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Gestión de Datos
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className={`text-sm font-medium mb-2 text-red-600`}>
                  Borrar Todos los Datos
                </h4>
                <p className={`text-xs mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Esta acción eliminará permanentemente todos tus datos financieros
                </p>
                <button
                  onClick={handleClearData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Borrar Todos los Datos
                </button>
              </div>
            </div>
          </div>

          {/* Storage Info */}
          <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Información de Almacenamiento
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Tipo de almacenamiento:
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Navegador (LocalStorage)
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ubicación:
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Local
                </span>
              </div>
              <div className="flex justify-between">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sincronización:
                </span>
                <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  No disponible
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};