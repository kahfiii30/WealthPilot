const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/src/trading');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace to="/..." with to="/trading/..."
    content = content.replace(/to="\/(?!\/)(?!trading\/)/g, 'to="/trading/');
    
    // Replace navigate('/...') with navigate('/trading/...')
    content = content.replace(/navigate\('\/(?!\/)(?!trading\/)/g, 'navigate(\'/trading/');
    
    if (original !== content) {
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
});
