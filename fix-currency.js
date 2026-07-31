const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if(!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:\\rohit projects\\rudra\\src');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace JSX interpolation: >${val}
    content = content.replace(/>\$\{/g, '>₹{');
    // Replace JSX interpolation multiline: \n  ${val}
    content = content.replace(/^(\s*)\$\{/gm, '$1₹{');
    // Replace template string dollar sign: `$${val}`
    content = content.replace(/\$\$\{/g, '₹${');
    // Replace literal dollar sign before numbers: $75, $ 100
    content = content.replace(/\$(?=\s*\d)/g, '₹');
    // Replace text 'USA (USD) $'
    content = content.replace(/\(USD\) \$/g, '(INR) ₹');
    // Replace trailing dollar sign in shop
    content = content.replace(/\{product\.price\.toFixed\(2\)\} \$/g, '₹{product.price.toFixed(2)}');
    
    // Replace icon
    if(content.includes('DollarSign')) {
        content = content.replace(/DollarSign/g, 'IndianRupee');
    }

    // Navbar change Best Sellers -> Home
    if (file.replace(/\\/g, '/').endsWith('components/Header.tsx')) {
        content = content.replace(/href="\/best-sellers"([^>]+)>Best Sellers<\/a>/g, 'href="/"$1>Home</a>');
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
        console.log('Updated ' + file);
    }
});

console.log('Finished updating ' + count + ' files.');
