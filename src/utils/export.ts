import { Transaction, SavingsGoal, Debt } from '../types';
import { formatCurrency } from './calculations';
import jsPDF from 'jspdf';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsToPDF = (transactions: Transaction[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Reporte de Transacciones', 20, 20);
  
  doc.setFontSize(12);
  let y = 40;
  
  transactions.forEach((transaction, index) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    const date = new Date(transaction.date).toLocaleDateString();
    const amount = formatCurrency(transaction.amount);
    const type = transaction.type === 'income' ? 'Ingreso' : 'Gasto';
    
    doc.text(`${date} - ${type}: ${amount}`, 20, y);
    doc.text(`Categoría: ${transaction.category}`, 20, y + 5);
    doc.text(`Descripción: ${transaction.description}`, 20, y + 10);
    
    y += 20;
  });
  
  doc.save('transacciones.pdf');
};