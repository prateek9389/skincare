import fs from 'fs';

const path = 'c:\\Users\\prate\\Desktop\\rudra\\src\\data\\products.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/  ingredients\?: string\[\];\n\}/, '  ingredients?: string[];\n  returnPolicyAvailable?: boolean;\n  returnPolicyDays?: number;\n  quantities?: { label: string; price: number; image?: string }[];\n}');

content = content.replace(/(\r?\n  \},)/g, ',\n    quantities: [\n      { label: "25ml", price: 50 },\n      { label: "50ml", price: 100 },\n      { label: "100ml", price: 150 }\n    ]$1');

content = content.replace(/(\r?\n  \}\r?\n\];)/g, ',\n    quantities: [\n      { label: "25ml", price: 50 },\n      { label: "50ml", price: 100 },\n      { label: "100ml", price: 150 }\n    ]$1');

fs.writeFileSync(path, content);
console.log("products.ts successfully updated with quantities and commas!");
