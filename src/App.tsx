import React, { useState, useEffect } from 'react';
import { Home, Users, FileText, Settings, Menu, X, LogOut } from 'lucide-react';
import { FundDashboard } from './components/FundDashboard';
import { UserManagement } from './components/UserManagement';
import { Reports } from './components/Reports';
import { Settings as SettingsComponent } from './components/Settings';
import { AuthForm } from './components/AuthForm';
import { Settings as SettingsType, User } from './types';
import { authService } from './utils/auth';

type Tab = 'dashboard' | 'users' | 'reports' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [settings, setSettings] = useState<SettingsType>({
    currency: 'USD',
    darkMode: false,
    notifications: true,
    language: 'es'
  });

  // Check authentication and load data on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadSettings();
    }
    setIsLoading(false);
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('savings-fund-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    loadSettings();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSettings({
      currency: 'USD',
      darkMode: false,
      notifications: true,
      language: 'es'
    });
  };

  // Apply dark mode
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Settings handlers
  const handleUpdateSettings = (updates: Partial<SettingsType>) => {
    const updatedSettings = { ...settings, ...updates };
    setSettings(updatedSettings);
    localStorage.setItem('savings-fund-settings', JSON.stringify(updatedSettings));
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    ...(user?.role === 'admin' ? [{ id: 'users', name: 'Usuarios', icon: Users }] : []),
    { id: 'reports', name: 'Reportes', icon: FileText },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FundDashboard darkMode={settings.darkMode} />;
      case 'users':
        return user?.role === 'admin' ? <UserManagement darkMode={settings.darkMode} /> : <FundDashboard darkMode={settings.darkMode} />;
      case 'reports':
        return <Reports darkMode={settings.darkMode} />;
      case 'settings':
        return <SettingsComponent settings={settings} onUpdateSettings={handleUpdateSettings} darkMode={settings.darkMode} />;
      default:
        return <FundDashboard darkMode={settings.darkMode} />;
    }
  };

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} darkMode={settings.darkMode} />;
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className={`flex items-center justify-between p-4 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <h1 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
            💰 Fondo de Ahorro
          </h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 rounded-md ${settings.darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="lg:flex">
        {/* Sidebar */}
        <div className={`${
          isMobileMenuOpen ? 'block' : 'hidden'
        } lg:block lg:w-64 lg:fixed lg:inset-y-0 ${settings.darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
              <h1 className={`text-xl font-bold ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                💰 FinanceApp
              </h1>
            </div>
            
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as Tab);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : `${settings.darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className={`p-4 border-t ${settings.darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-medium ${settings.darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.name}
                  </p>
                  <p className={`text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.email}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Miembro'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className={`ml-auto p-2 rounded-md ${settings.darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                  title="Cerrar sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:ml-64 flex-1">
          <main className="p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;