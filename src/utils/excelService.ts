import { SavingsEntry, User } from '../types';
import { authService } from './auth';
import { savingsService } from './savingsService';
import * as XLSX from 'xlsx';

export const excelService = {
  // Export users to Excel with proper table formatting
  exportUsersToExcel: () => {
    const users = authService.getAllUsersPublic().filter(u => u.role === 'member');
    const entries = savingsService.getAllSavings();
    
    // Create comprehensive user data
    const userData = users.map(user => {
      const userEntries = entries.filter(entry => entry.userId === user.id);
      const lastEntry = userEntries[userEntries.length - 1];
      
      return {
        'ID Usuario': user.id,
        'Nombre': user.name,
        'Email': user.email,
        'Estado': user.isActive ? 'Activo' : 'Inactivo',
        'Total Ahorrado': user.totalSavings,
        'Número de Depósitos': userEntries.length,
        'Último Depósito': lastEntry ? new Date(lastEntry.date).toLocaleDateString() : 'N/A',
        'Último Monto': lastEntry ? lastEntry.amount : 0,
        'Fecha de Registro': new Date(user.createdAt).toLocaleDateString()
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create users worksheet
    const usersWs = XLSX.utils.json_to_sheet(userData);
    
    // Set column widths
    const usersColWidths = [
      { wch: 12 }, // ID Usuario
      { wch: 25 }, // Nombre
      { wch: 30 }, // Email
      { wch: 10 }, // Estado
      { wch: 15 }, // Total Ahorrado
      { wch: 18 }, // Número de Depósitos
      { wch: 15 }, // Último Depósito
      { wch: 15 }, // Último Monto
      { wch: 18 }  // Fecha de Registro
    ];
    usersWs['!cols'] = usersColWidths;
    
    // Add table formatting
    const usersRange = XLSX.utils.decode_range(usersWs['!ref'] || 'A1');
    usersWs['!autofilter'] = { ref: usersWs['!ref'] };
    
    XLSX.utils.book_append_sheet(wb, usersWs, 'Usuarios');

    // Create summary worksheet
    const totalFund = users.reduce((sum, user) => sum + user.totalSavings, 0);
    const activeUsers = users.filter(u => u.isActive).length;
    const totalDeposits = entries.length;
    
    const summaryData = [
      { 'Métrica': 'Total de Miembros', 'Valor': users.length },
      { 'Métrica': 'Miembros Activos', 'Valor': activeUsers },
      { 'Métrica': 'Total del Fondo', 'Valor': totalFund },
      { 'Métrica': 'Total de Depósitos', 'Valor': totalDeposits },
      { 'Métrica': 'Promedio por Miembro', 'Valor': users.length > 0 ? Math.round(totalFund / users.length) : 0 }
    ];
    
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');

    // Save file
    XLSX.writeFile(wb, `fondo-ahorro-usuarios-${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // Export savings entries to Excel with proper table formatting
  exportSavingsToExcel: () => {
    const entries = savingsService.getAllSavings();
    const users = authService.getAllUsersPublic();
    
    // Create detailed entries data
    const entriesData = entries.map(entry => {
      const user = users.find(u => u.id === entry.userId);
      const createdBy = users.find(u => u.id === entry.createdBy);
      
      return {
        'ID': entry.id,
        'Usuario': user?.name || 'Usuario no encontrado',
        'Email Usuario': user?.email || '',
        'Monto': entry.amount,
        'Fecha': new Date(entry.date).toLocaleDateString(),
        'Descripción': entry.description,
        'Registrado Por': createdBy?.name || 'Admin',
        'Fecha de Registro': new Date(entry.createdAt).toLocaleDateString()
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create entries worksheet
    const entriesWs = XLSX.utils.json_to_sheet(entriesData);
    
    // Set column widths
    const entriesColWidths = [
      { wch: 12 }, // ID
      { wch: 25 }, // Usuario
      { wch: 30 }, // Email Usuario
      { wch: 12 }, // Monto
      { wch: 12 }, // Fecha
      { wch: 30 }, // Descripción
      { wch: 20 }, // Registrado Por
      { wch: 18 }  // Fecha de Registro
    ];
    entriesWs['!cols'] = entriesColWidths;
    
    // Add table formatting
    entriesWs['!autofilter'] = { ref: entriesWs['!ref'] };
    
    XLSX.utils.book_append_sheet(wb, entriesWs, 'Movimientos');

    // Create monthly summary
    const monthlyData = entries.reduce((acc, entry) => {
      const month = new Date(entry.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      if (!acc[month]) {
        acc[month] = { month, total: 0, count: 0 };
      }
      acc[month].total += entry.amount;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { month: string; total: number; count: number }>);

    const monthlyArray = Object.values(monthlyData).map(item => ({
      'Mes': item.month,
      'Total Ahorrado': item.total,
      'Número de Depósitos': item.count,
      'Promedio por Depósito': Math.round(item.total / item.count)
    }));

    const monthlyWs = XLSX.utils.json_to_sheet(monthlyArray);
    monthlyWs['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, monthlyWs, 'Resumen Mensual');

    // Save file
    XLSX.writeFile(wb, `movimientos-ahorro-${new Date().toISOString().split('T')[0]}.xlsx`);
  },

  // Legacy CSV export (keeping for compatibility)
  exportToCSV: () => {
    excelService.exportUsersToExcel();
  },

  exportSavingsEntries: () => {
    excelService.exportSavingsToExcel();
  },

  // Import data from CSV (unchanged)
  importFromCSV: (file: File): Promise<{ success: boolean; message: string; imported?: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          
          let imported = 0;
          const errors: string[] = [];

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const row: any = {};
            
            headers.forEach((header, index) => {
              row[header] = values[index];
            });

            // Try to import as user data
            if (row['Nombre']) {
              const result = authService.createUser({
                name: row['Nombre'],
                email: row['Email'] || `${row['Nombre'].toLowerCase().replace(/\s+/g, '')}@fondo.com`,
                password: '123456', // Default password
                role: 'member'
              });

              if (result.success) {
                imported++;
                
                // If there's savings data, add it
                if (row['Total Ahorrado'] && parseFloat(row['Total Ahorrado']) > 0) {
                  savingsService.addSavingsEntry(
                    result.user!.id,
                    parseFloat(row['Total Ahorrado']),
                    'Importado desde Excel'
                  );
                }
              } else {
                errors.push(`Error importando ${row['Nombre']}: ${result.error}`);
              }
            }
          }

          if (imported > 0) {
            resolve({
              success: true,
              message: `Se importaron ${imported} registros exitosamente.${errors.length > 0 ? ` ${errors.length} errores encontrados.` : ''}`,
              imported
            });
          } else {
            resolve({
              success: false,
              message: 'No se pudieron importar datos. Verifica el formato del archivo.'
            });
          }
        } catch (error) {
          resolve({
            success: false,
            message: 'Error al procesar el archivo. Verifica que sea un CSV válido.'
          });
        }
      };

      reader.readAsText(file);
    });
  }
};