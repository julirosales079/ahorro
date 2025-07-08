import { SavingsEntry, User } from '../types';
import { authService } from './auth';
import { savingsService } from './savingsService';

export const excelService = {
  // Export data to CSV (Excel compatible)
  exportToCSV: () => {
    const users = authService.getAllUsersPublic().filter(u => u.role === 'member');
    const entries = savingsService.getAllSavings();
    
    // Create comprehensive data
    const exportData = users.map(user => {
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

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fondo-ahorro-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export detailed savings entries
  exportSavingsEntries: () => {
    const entries = savingsService.getAllSavings();
    const users = authService.getAllUsersPublic();
    
    const exportData = entries.map(entry => {
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

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movimientos-ahorro-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Import data from CSV
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
            if (row['Nombre'] && row['Email']) {
              const result = authService.createUser({
                name: row['Nombre'],
                email: row['Email'],
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