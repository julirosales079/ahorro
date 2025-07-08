import React, { useState } from 'react';
import { User, LogIn, UserPlus, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authService, LoginCredentials, RegisterData } from '../utils/auth';

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
  darkMode: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess, darkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState<RegisterData>({
    name: '',
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = authService.login(loginData);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = authService.register(registerData);
      if (result.success && result.user) {
        onAuthSuccess(result.user);
      } else {
        setError(result.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error inesperado al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '' });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 flex items-center justify-center rounded-full ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className={`mt-6 text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            💰 Fondo de Ahorro
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {isLogin ? 'Inicia sesión en el fondo' : 'Únete al fondo de ahorro'}
          </p>
        </div>

        {/* Form */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-8 px-6 shadow-xl rounded-lg`}>
          <form className="space-y-6" onSubmit={isLogin ? handleLogin : handleRegister}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Nombre completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    required
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  required
                  value={isLogin ? loginData.email : registerData.email}
                  onChange={(e) => {
                    if (isLogin) {
                      setLoginData({ ...loginData, email: e.target.value });
                    } else {
                      setRegisterData({ ...registerData, email: e.target.value });
                    }
                  }}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={isLogin ? loginData.password : registerData.password}
                  onChange={(e) => {
                    if (isLogin) {
                      setLoginData({ ...loginData, password: e.target.value });
                    } else {
                      setRegisterData({ ...registerData, password: e.target.value });
                    }
                  }}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder={isLogin ? 'Tu contraseña' : 'Mínimo 6 caracteres'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  ) : (
                    <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className={`text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors`}
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión aquí'
              }
            </button>
          </div>
        </div>

        {/* Demo Info */}
        <div className={`text-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Sistema de gestión de fondo de ahorro colectivo</p>
          <p>El primer usuario registrado será el administrador</p>
        </div>
      </div>
    </div>
  );
};