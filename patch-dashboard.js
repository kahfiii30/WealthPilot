const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/Dashboard.jsx', 'utf8');

// Import exportToPDF
code = code.replace(/import \{ exportToCSV \} from '\.\.\/utils\/export';/i, "import { exportToCSV, exportToPDF } from '../utils/export';");

// Add button next to Export CSV
const targetButton = /<button\s*onClick=\{\(\) => exportToCSV\(filteredTransactions, `WealthPilot-\$\{selectedMonth\}`\)\}\s*className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2"\s*>\s*<span className="material-symbols-outlined text-sm">download<\/span>\s*Export CSV\s*<\/button>/i;

const replacementButton = `<button
            onClick={() => exportToCSV(filteredTransactions, \`WealthPilot-\${selectedMonth}\`)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            CSV
          </button>
          <button
            onClick={() => {
              const summary = {
                totalIncome: fm(totalIncome),
                totalExpense: fm(totalExpense),
                savings: fm(savings),
                totalAssets: fm(totalAssets),
                totalDebts: fm(totalDebts)
              };
              exportToPDF(filteredTransactions, summary, \`WealthPilot-Report-\${selectedMonth}\`);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            PDF
          </button>`;

code = code.replace(targetButton, replacementButton);

// Apply Framer Motion to the main grid
const targetGrid = /<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">/i;
const replacementGrid = `<motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
      >`;
code = code.replace(targetGrid, replacementGrid);
code = code.replace(/<\/div>\s*\{\/\* Charts Section \*\/\}/i, "</motion.div>\n\n      {/* Charts Section */}");

fs.writeFileSync('frontend/src/pages/Dashboard.jsx', code);
console.log("Patched Dashboard.jsx");
