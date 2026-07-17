const fs = require('fs');
let code = fs.readFileSync('telegram-bot/bot.js', 'utf8');

const target = /let totalAssets = assetRes\.data\.reduce\(\(acc, a\) => acc \+ Number\(a\.amount\), 0\);/i;

const replacement = `let btcPrice = 0;
    try {
      const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=idr');
      const btcData = await btcRes.json();
      btcPrice = btcData.bitcoin.idr;
    } catch(e) {
      console.log("Failed to fetch crypto price");
    }

    let totalAssets = 0;
    for (let a of assetRes.data) {
      let amount = Number(a.amount);
      if (a.asset_type === 'crypto' && a.symbol && a.quantity) {
        if (a.symbol.toLowerCase() === 'btc' || a.symbol.toLowerCase() === 'bitcoin') {
          amount = a.quantity * btcPrice;
          // Dynamically update the amount in memory so it reflects correctly
          a.amount = amount;
        }
      } else if (a.name.toUpperCase().includes('BITCOIN') && a.amount > 0 && btcPrice > 0) {
        // Fallback: If it's the old BITCOIN entry and has no quantity, assume it's just IDR value, or if they update it to be 0.0016 BTC in the name we could parse it, but for now we rely on DB schema update. 
        // Wait, the DB schema is updated but they haven't filled 'quantity' yet. 
        // We will just leave it as fiat amount if quantity is missing.
      }
      totalAssets += amount;
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('telegram-bot/bot.js', code);
console.log("Patched crypto prices in bot.js");
