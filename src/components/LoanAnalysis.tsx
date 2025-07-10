import React, { useState, useEffect } from 'react';
import { Calculator as Calculadora, DollarSign as SignoDolar, LucideCurrency as TendenciaArriba, SquareUser as Usuarios, Archive as TextoArchivo, Map as Mas, AArrowDown as Ojo, AlertTriangle as TrianguloAlerta, CheckCircle as CirculoCheck } from 'lucide-react';
import { Usuario, AnalisisPrestamo as TipoAnalisisPrestamo } from '../types';
import { authService as servicioAutenticacion } from '../utils/auth';
import { savingsService as servicioAhorros } from '../utils/savingsService';
import { loanService as servicioPrestamo } from '../utils/loanService';
import { formatCurrency } from '../utils/calculations';

interface PropiedadesAnalisisPrestamo {
  modoOscuro: boolean;
}

export const AnalisisPrestamo: React.FC<PropiedadesAnalisisPrestamo> = ({ modoOscuro }) => {
  const [users, establecerUsuarios] = useState<Usuario[]>([]);
  const [selectedUser, establecerUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [showAnalysisForm, establecerMostrarFormularioAnalisis] = useState(false);
  const [interestRate, establecerTasaInteres] = useState('');
  const [termMonths, establecerPlazoMeses] = useState('12');
  const [loanPercentage, establecerPorcentajePrestamo] = useState('80');
  const [analysisResults, establecerResultadosAnalisis] = useState<any>(null);
  const [showConfirmationModal, establecerMostrarModalConfirmacion] = useState(false);
  const [successMessage, establecerMensajeExito] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    const allUsers = servicioAutenticacion.obtenerTodosUsuariosPublico().filter(u => u.role === 'miembro' && u.isActive);
    establecerUsuarios(allUsers);
  };

  const calcularAnalisisPrestamo = (usuario: Usuario) => {
    const ahorros = usuario.totalAhorros;
    const montoMaximoPrestamo = (ahorros * parseFloat(loanPercentage)) / 100;
    const meses = parseInt(termMonths);

    // 🔧 Nueva Fórmula Implementada:
    // 1. Cuota de capital fija = Monto del préstamo ÷ Número de meses
    const principalPayment = montoMaximoPrestamo / meses;
    
    // 2. Interés por cuota = Monto del préstamo × Tasa de interés
    const interestRate_decimal = parseFloat(interestRate) / 100;
    const interestPerPayment = montoMaximoPrestamo * interestRate_decimal;
    
    // 3. Cuota total mensual = Cuota de capital + Interés por cuota
    const cuotaMensual = principalPayment + interestPerPayment;
    
    // 4. Total a pagar = Cuota mensual × Número de meses
    const totalPago = cuotaMensual * meses;
    
    // 5. Total de intereses = Total a pagar - Monto del préstamo
    const totalInteres = totalPago - montoMaximoPrestamo;

    return {
      maxLoanAmount: montoMaximoPrestamo,
      monthlyPayment: cuotaMensual,
      totalPayment: totalPago,
      totalInterest: totalInteres,
      interestPerPayment,
      principalPayment,
      interestRate: parseFloat(interestRate),
      termMonths: meses,
      loanPercentage: parseFloat(loanPercentage)
    };
  };

  const manejarAnalizarUsuario = (usuario: Usuario) => {
    establecerUsuarioSeleccionado(usuario);
    const analisis = calcularAnalisisPrestamo(usuario);
    establecerResultadosAnalisis(analisis);
    establecerMostrarFormularioAnalisis(true);
  };

  const manejarCrearPrestamo = async () => {
    if (!selectedUser || !analysisResults) return;

    try {
      const resultado = servicioPrestamo.crearPrestamo(
        selectedUser.id,
        analysisResults.maxLoanAmount,
        analysisResults.interestRate,
        analysisResults.termMonths
      );

      if (resultado.success) {
        establecerMostrarModalConfirmacion(false);
        establecerMostrarFormularioAnalisis(false);
        establecerUsuarioSeleccionado(null);
        establecerResultadosAnalisis(null);
        
        // Mostrar mensaje de éxito en la aplicación
        establecerMensajeExito(`✅ Préstamo creado exitosamente para ${selectedUser.name}. 
        
📋 Detalles del préstamo:
💰 Monto: ${formatCurrency(analysisResults.maxLoanAmount)}
📊 Tasa de interés: ${analysisResults.interestRate}%
💵 Interés por cuota: ${formatCurrency(analysisResults.interestPerPayment)}
💳 Capital por cuota: ${formatCurrency(analysisResults.principalPayment)}
💰 Cuota mensual: ${formatCurrency(analysisResults.monthlyPayment)}
📈 Interés total: ${formatCurrency(analysisResults.totalInterest)}
💳 Total a pagar: ${formatCurrency(analysisResults.totalPayment)}
📅 Plazo: ${analysisResults.termMonths} meses

🔧 Fórmula aplicada:
• Monto mensual = ${formatCurrency(analysisResults.maxLoanAmount)} ÷ ${analysisResults.termMonths} = ${formatCurrency(analysisResults.principalPayment)}
• Monto mensual restante = ${formatCurrency(analysisResults.maxLoanAmount)} - ${formatCurrency(analysisResults.principalPayment)} = ${formatCurrency(montoMes)}
• Tasa de interés mensual = ${formatCurrency(montoMes)} × ${analysisResults.interestRate}% = ${formatCurrency(analysisResults.interestPerPayment)}
• Total de interés = ${formatCurrency(analysisResults.interestPerPayment)} × ${analysisResults.termMonths} = ${formatCurrency(analysisResults.totalInterest)}
• Total a pagar = ${formatCurrency(analysisResults.maxLoanAmount)} + ${formatCurrency(analysisResults.totalInterest)} = ${formatCurrency(analysisResults.totalPayment)}
• Cuota mensual = (${formatCurrency(analysisResults.totalPayment)} ÷ ${analysisResults.termMonths}) + ${formatCurrency(analysisResults.interestPerPayment)} = ${formatCurrency(analysisResults.monthlyPayment)}

El préstamo está disponible en la sección "Gestión de Préstamos" donde podrás registrar los pagos.`);
        
        // Borrar mensaje después de 10 segundos
        setTimeout(() => establecerMensajeExito(''), 10000);
      } else {
        alert('Error al crear el préstamo: ' + resultado.error);
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      alert('Error inesperado al crear el préstamo');
    }
  };

  const obtenerNivelRiesgo = (ahorros: number) => {
    if (ahorros >= 1000000) return { level: 'Bajo', color: 'text-green-600', bg: 'bg-green-100' };
    if (ahorros >= 500000) return { level: 'Medio', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (ahorros >= 100000) return { level: 'Alto', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Muy Alto', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const obtenerPorcentajePrestamoRecomendado = (ahorros: number) => {
    if (ahorros >= 1000000) return 90;
    if (ahorros >= 500000) return 80;
    if (ahorros >= 100000) return 70;
    return 50;
  };

  return (
    <div className="space-y-6">
      {/* Mensaje de Éxito */}
      {successMessage && (
        <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'} border ${modoOscuro ? 'border-green-800' : 'border-green-200'}`}>
          <div className="flex items-start space-x-3">
            <CirculoCheck className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className={`font-semibold text-green-600 mb-2`}>
                Préstamo Creado Exitosamente
              </h3>
              <div className={`text-sm ${modoOscuro ? 'text-green-200' : 'text-green-800'} whitespace-pre-line`}>
                {successMessage}
              </div>
              <button
                onClick={() => establecerMensajeExito('')}
                className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
              >
                Cerrar mensaje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
            Análisis de Préstamos
          </h2>
          <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
            Analiza la capacidad de préstamo de cada usuario basado en sus ahorros
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calculadora className="h-6 w-6 text-blue-600" />
        </div>
      </div>

      {/* Configuración Global */}
      <div className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <h3 className={`text-lg font-semibold mb-4 ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
          Configuración Global de Préstamos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
              Tasa de Interés (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => establecerTasaInteres(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                modoOscuro 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <p className={`text-xs mt-1 ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
              Tasa de interés total para el préstamo
            </p>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
              Plazo (Meses)
            </label>
            <select
              value={termMonths}
              onChange={(e) => establecerPlazoMeses(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                modoOscuro 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="6">6 meses</option>
              <option value="12">12 meses</option>
              <option value="18">18 meses</option>
              <option value="24">24 meses</option>
              <option value="36">36 meses</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
              % del Ahorro Prestable
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={loanPercentage}
              onChange={(e) => establecerPorcentajePrestamo(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border ${
                modoOscuro 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>
      </div>

      {/* Grilla de Análisis de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((usuario) => {
          const userSavings = servicioAhorros.obtenerAhorrosPorUsuario(usuario.id);
          const lastSaving = userSavings[userSavings.length - 1];
          const riesgo = obtenerNivelRiesgo(usuario.totalAhorros);
          const porcentajeRecomendado = obtenerPorcentajePrestamoRecomendado(usuario.totalAhorros);
          const quickAnalysis = calcularAnalisisPrestamo(usuario);
          
          return (
            <div key={usuario.id} className={`p-6 rounded-lg ${modoOscuro ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-blue-500`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {usuario.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {usuario.name}
                    </h3>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                      {usuario.email}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${riesgo.bg} ${riesgo.color}`}>
                  Riesgo {riesgo.level}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                      Total Ahorrado
                    </p>
                    <p className={`font-semibold text-green-600`}>
                      {formatCurrency(usuario.totalSavings)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                      Depósitos
                    </p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {userSavings.length}
                    </p>
                  </div>
                </div>
                
                <div className={`p-3 rounded-lg ${modoOscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className={`text-sm font-medium ${modoOscuro ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Análisis Rápido
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>Préstamo máximo:</span>
                      <span className={`font-medium text-blue-600`}>
                        {formatCurrency(quickAnalysis.maxLoanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>Cuota mensual:</span>
                      <span className={`font-medium ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(quickAnalysis.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-400' : 'text-gray-600'}`}>% Recomendado:</span>
                      <span className={`font-medium text-orange-600`}>
                        {porcentajeRecomendado}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {lastSaving && (
                  <div className="flex justify-between text-sm">
                    <span className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                      Último depósito:
                    </span>
                    <span className={`${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(lastSaving.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <button
                  onClick={() => manejarAnalizarUsuario(usuario)}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Ojo size={16} />
                  <span>Análisis Detallado</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Análisis Detallado */}
      {showAnalysisForm && selectedUser && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-4xl w-full rounded-lg shadow-xl ${modoOscuro ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            {/* Encabezado */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                    Análisis Detallado de Préstamo
                  </h3>
                  <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedUser.name} - {selectedUser.email}
                  </p>
                </div>
                <button
                  onClick={() => establecerMostrarFormularioAnalisis(false)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Resumen de Información del Usuario */}
              <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                  Información del Usuario
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total Ahorrado</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedUser.totalSavings)}</p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Depósitos</p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {servicioAhorros.obtenerAhorrosPorUsuario(selectedUser.id).length}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Nivel de Riesgo</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${obtenerNivelRiesgo(selectedUser.totalSavings).bg} ${obtenerNivelRiesgo(selectedUser.totalSavings).color}`}>
                      {obtenerNivelRiesgo(selectedUser.totalSavings).level}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>% Recomendado</p>
                    <p className="font-semibold text-orange-600">
                      {obtenerPorcentajePrestamoRecomendado(selectedUser.totalSavings)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Parámetros del Préstamo */}
              <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                  Parámetros del Préstamo
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tasa de Interés (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => {
                        establecerTasaInteres(e.target.value);
                        establecerResultadosAnalisis(calcularAnalisisPrestamo(selectedUser));
                      }}
                      className={`w-full px-3 py-2 rounded-md border ${
                        modoOscuro 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                      Plazo (Meses)
                    </label>
                    <select
                      value={termMonths}
                      onChange={(e) => {
                        establecerPlazoMeses(e.target.value);
                        establecerResultadosAnalisis(calcularAnalisisPrestamo(selectedUser));
                      }}
                      className={`w-full px-3 py-2 rounded-md border ${
                        modoOscuro 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="6">6 meses</option>
                      <option value="12">12 meses</option>
                      <option value="18">18 meses</option>
                      <option value="24">24 meses</option>
                      <option value="36">36 meses</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${modoOscuro ? 'text-gray-300' : 'text-gray-700'}`}>
                      % del Ahorro Prestable
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="100"
                      value={loanPercentage}
                      onChange={(e) => {
                        establecerPorcentajePrestamo(e.target.value);
                        establecerResultadosAnalisis(calcularAnalisisPrestamo(selectedUser));
                      }}
                      className={`w-full px-3 py-2 rounded-md border ${
                        modoOscuro 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>
              </div>

              {/* Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${modoOscuro ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'}`}>
                  <h4 className={`font-semibold mb-3 text-blue-600`}>
                    Resultados del Análisis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Monto máximo del préstamo:</span>
                      <span className={`font-bold text-blue-600`}>
                        {formatCurrency(analysisResults.maxLoanAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Cuota mensual:</span>
                      <span className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analysisResults.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total a pagar:</span>
                      <span className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(analysisResults.totalPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total de intereses:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(analysisResults.totalInterest)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border-l-4 border-green-500 ${modoOscuro ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'}`}>
                  <h4 className={`font-semibold mb-3 text-green-600`}>
                    Recomendaciones
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className={`p-2 rounded ${modoOscuro ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`font-medium ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                        Capacidad de Pago
                      </p>
                      <p className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                        {analysisResults.monthlyPayment <= selectedUser.totalSavings * 0.1 
                          ? '✅ Excelente capacidad de pago' 
                          : analysisResults.monthlyPayment <= selectedUser.totalSavings * 0.2
                          ? '⚠️ Capacidad de pago moderada'
                          : '❌ Capacidad de pago limitada'
                        }
                      </p>
                    </div>
                    <div className={`p-2 rounded ${modoOscuro ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`font-medium ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                        Rentabilidad
                      </p>
                      <p className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                        Ganancia de {formatearMoneda(analysisResults.totalInterest)} en {termMonths} meses
                      </p>
                    </div>
                    <div className={`p-2 rounded ${modoOscuro ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`font-medium ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                        Porcentaje Sugerido
                      </p>
                      <p className={`${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                        {obtenerPorcentajePrestamoRecomendado(selectedUser.totalSavings)}% del ahorro total
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className={`px-6 py-4 border-t ${modoOscuro ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={() => establecerMostrarFormularioAnalisis(false)}
                className={`px-4 py-2 rounded-md border ${
                  modoOscuro 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cerrar
              </button>
              <button
                onClick={() => establecerMostrarModalConfirmacion(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Mas size={16} />
                <span>Crear Préstamo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showConfirmationModal && selectedUser && analysisResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-lg shadow-xl ${modoOscuro ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            {/* Encabezado */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mas className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                    Confirmar Creación de Préstamo
                  </h3>
                  <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>
                    Revisa los detalles antes de crear el préstamo
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Información del Usuario */}
              <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} border ${modoOscuro ? 'border-blue-800' : 'border-blue-200'}`}>
                <h4 className={`font-semibold mb-3 text-blue-600 flex items-center`}>
                  👤 Información del Beneficiario
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Nombre:</p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {selectedUser.name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Email:</p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {selectedUser.email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total Ahorrado:</p>
                    <p className="font-semibold text-green-600">
                      {formatCurrency(selectedUser.totalSavings)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Nivel de Riesgo:</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${obtenerNivelRiesgo(selectedUser.totalSavings).bg} ${obtenerNivelRiesgo(selectedUser.totalSavings).color}`}>
                      {obtenerNivelRiesgo(selectedUser.totalSavings).level}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles del Préstamo */}
              <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'} border ${modoOscuro ? 'border-green-800' : 'border-green-200'}`}>
                <h4 className={`font-semibold mb-3 text-green-600 flex items-center`}>
                  💰 Detalles del Préstamo
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Monto del Préstamo:</p>
                    <p className="font-bold text-green-600 text-lg">
                      {formatCurrency(analysisResults.maxLoanAmount)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Tasa de Interés:</p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {analysisResults.interestRate}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Plazo:</p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {analysisResults.termMonths} meses
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Cuota Mensual:</p>
                    <p className="font-bold text-blue-600 text-lg">
                      {formatCurrency(analysisResults.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total a Pagar:</p>
                    <p className={`font-semibold ${modoOscuro ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(analysisResults.totalPayment)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${modoOscuro ? 'text-gray-300' : 'text-gray-600'}`}>Total de Intereses:</p>
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(analysisResults.totalInterest)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas Importantes */}
              <div className={`p-4 rounded-lg ${modoOscuro ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'} border ${modoOscuro ? 'border-yellow-800' : 'border-yellow-200'}`}>
                <h4 className={`font-semibold mb-3 text-yellow-600 flex items-center`}>
                  <TrianguloAlerta className="h-5 w-5 mr-2" />
                  Información Importante
                </h4>
                <div className="space-y-2 text-sm">
                  <div className={`flex items-start space-x-2 ${modoOscuro ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>El préstamo se creará inmediatamente y estará disponible en "Gestión de Préstamos"</span>
                  </div>
                  <div className={`flex items-start space-x-2 ${modoOscuro ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>Podrás registrar pagos desde la sección de gestión de préstamos</span>
                  </div>
                  <div className={`flex items-start space-x-2 ${modoOscuro ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>El usuario debe ser informado sobre las condiciones del préstamo</span>
                  </div>
                  <div className={`flex items-start space-x-2 ${modoOscuro ? 'text-yellow-200' : 'text-yellow-800'}`}>
                    <span className="font-bold">•</span>
                    <span>Se recomienda establecer fechas de vencimiento para cada cuota</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className={`px-6 py-4 border-t ${modoOscuro ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
              <button
                onClick={() => establecerMostrarModalConfirmacion(false)}
                className={`px-4 py-2 rounded-md border ${
                  modoOscuro 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } transition-colors`}
              >
                Cancelar
              </button>
              <button
                onClick={manejarCrearPrestamo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Mas size={16} />
                <span>Confirmar y Crear Préstamo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {users.length === 0 && (
        <div className={`text-center py-12 ${modoOscuro ? 'text-gray-400' : 'text-gray-500'}`}>
          <Calculadora className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No hay usuarios activos para analizar</p>
          <p className="text-sm">Los usuarios deben tener ahorros registrados para poder analizar préstamos</p>
        </div>
      )}
    </div>
  );
};