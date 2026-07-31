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
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('d:\\rohit projects\\rudra\\src\\app');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix cartLoadedRef race condition
    content = content.replace(/cartLoadedRef\.current = true;/g, 'setTimeout(() => { cartLoadedRef.current = true; }, 100);');
    
    // Fix Toast Popup
    const oldToast = `<span>{toastMessage}</span>`;
    const newToast = `<span>Item is in cart</span>
            <a href="/checkout" className="bg-white text-[#0D3C6A] px-3 py-1.5 rounded-md hover:bg-neutral-200 transition-colors">View Cart</a>`;
    content = content.replace(oldToast, newToast);
    
    // Fix Toast message setter if necessary (optional since we override the span text)
    // content = content.replace(/setToastMessage\(`✨ \$\{product\.name\} added to bag.`\);/g, 'setToastMessage("show");');
    
    // Add missing useEffect in checkout/page.tsx
    if (file.replace(/\\/g, '/').endsWith('checkout/page.tsx')) {
        if (!content.includes('localStorage.setItem("gunalife_cart", JSON.stringify(cartItems))')) {
            const hookStr = `  useEffect(() => {
    if (cartLoadedRef.current) {
      localStorage.setItem("gunalife_cart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const handleUpdateQuantity`;
            content = content.replace(/  const handleUpdateQuantity/g, hookStr);
        }
    }

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
        console.log('Updated ' + file);
    }
});

console.log('Finished updating ' + count + ' files.');
