const fs = require('fs');
let code = fs.readFileSync('frontend/src/utils/export.js', 'utf8');

code += `

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToPDF = (transactions, summaryData, filename) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text('WealthPilot Pro - Laporan Keuangan', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(\`Dicetak pada: \${new Date().toLocaleString()}\`, 14, 30);

  // Summary Table
  doc.autoTable({
    startY: 40,
    head: [['Ringkasan', 'Jumlah']],
    body: [
      ['Pemasukan', summaryData.totalIncome],
      ['Pengeluaran', summaryData.totalExpense],
      ['Sisa Kas', summaryData.savings],
      ['Total Aset', summaryData.totalAssets],
      ['Total Hutang', summaryData.totalDebts]
    ],
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Transactions Table
  const tableData = transactions.map(t => [
    t.date || '',
    t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    t.category || '',
    t.note || '',
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.amount || 0)
  ]);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 15,
    head: [['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Jumlah']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [52, 73, 94] },
  });

  doc.save(\`\${filename}.pdf\`);
};
`;
fs.writeFileSync('frontend/src/utils/export.js', code);
console.log("Patched export.js");
