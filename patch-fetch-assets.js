const fs = require('fs');
let code = fs.readFileSync('frontend/src/services/financeService.js', 'utf8');

const target = /export const fetchAssets = async \(userId\) => \{\s*const \{ data, error \} = await supabase\s*\.from\('assets'\)\s*\.select\('\*'\)\s*\.eq\('user_id', userId\)\s*\.order\('updated_at', \{ ascending: false \}\);\s*if \(error\) throw error;\s*return \(data || \[\]\)\.map\(normalizeAsset\);\s*\};/i;

const replacement = `export const fetchAssets = async (userId) => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  
  let btcPrice = 0;
  try {
    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr');
    const btcData = await btcRes.json();
    btcPrice = btcData.bitcoin.idr;
  } catch(e) {
    console.warn("Failed to fetch crypto price", e);
  }

  const rawData = data || [];
  
  for (let a of rawData) {
    if (a.asset_type === 'crypto' && a.symbol && a.quantity) {
      if (a.symbol.toLowerCase() === 'btc' || a.symbol.toLowerCase() === 'bitcoin') {
        a.amount = a.quantity * btcPrice;
      }
    }
  }

  return rawData.map(normalizeAsset);
};`;

code = code.replace(target, replacement);
fs.writeFileSync('frontend/src/services/financeService.js', code);
console.log("Patched fetchAssets");
