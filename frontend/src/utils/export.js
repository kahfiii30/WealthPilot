export const exportToCSV = (transactions, filename) => {
  if (!transactions || !transactions.length) return;

  const headers = ['Date', 'Type', 'Category', 'Title/Note', 'Method', 'Amount'];
  
  const csvRows = [
    headers.join(','),
    ...transactions.map(t => {
      return [
        t.date || '',
        t.type || '',
        `"${t.category || ''}"`,
        `"${(t.title || t.note || '').replace(/"/g, '""')}"`,
        `"${t.method || ''}"`,
        t.amount || 0
      ].join(',');
    })
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
