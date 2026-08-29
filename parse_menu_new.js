const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');

const catalog = {};

const cardRegex = /<div class="menu-card(?: featured)?" data-item-id="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>/g;
let match;
while ((match = cardRegex.exec(html)) !== null) {
    const item_id = match[1];
    const block = match[2];
    
    const nameMatch = /<h3 data-en="([^"]+)" data-fi="([^"]+)">/.exec(block);
    const descMatch = /<p data-en="([^"]+)" data-fi="([^"]+)">/.exec(block);
    
    const dualPriceMatch = /Norm\. €([0-9.]+)(?:[\s\S]*?)Perhe €([0-9.]+)/.exec(block);
    
    const singlePriceRegex = /€([0-9.]+)/;
    const singlePriceMatch = singlePriceRegex.exec(block);
    
    const sizes = {};
    if (dualPriceMatch) {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: Math.round(parseFloat(dualPriceMatch[1]) * 100) };
      sizes.family = { label_en: "Family", label_fi: "Perhe", price: Math.round(parseFloat(dualPriceMatch[2]) * 100) };
    } else if (singlePriceMatch) {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: Math.round(parseFloat(singlePriceMatch[1]) * 100) };
    }
    
    catalog[item_id] = {
      id: item_id,
      category: "pizza",
      name_en: nameMatch ? nameMatch[1] : "",
      name_fi: nameMatch ? nameMatch[2] : "",
      desc_en: descMatch ? descMatch[1] : "",
      desc_fi: descMatch ? descMatch[2] : "",
      sizes: sizes
    };
}

const listRegex = /<div class="menu-list-item" data-item-id="([^"]+)">([\s\S]*?)<\/div>\s*<\/div>/g;
while ((match = listRegex.exec(html)) !== null) {
    const item_id = match[1];
    const block = match[2];
    
    const nameMatch = /<h4 data-en="([^"]+)" data-fi="([^"]+)">/.exec(block);
    const descMatch = /<p data-en="([^"]+)" data-fi="([^"]+)">/.exec(block);
    
    const singlePriceMatch = /€([0-9.]+)/.exec(block);
    
    const sizes = {};
    if (singlePriceMatch) {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: Math.round(parseFloat(singlePriceMatch[1]) * 100) };
    } else {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: 0 };
    }
    
    catalog[item_id] = {
      id: item_id,
      category: "other",
      name_en: nameMatch ? nameMatch[1] : "",
      name_fi: nameMatch ? nameMatch[2] : "",
      desc_en: descMatch ? descMatch[1] : "",
      desc_fi: descMatch ? descMatch[2] : "",
      sizes: sizes
    };
}

fs.writeFileSync('menu/catalog.js', 'const catalog = ' + JSON.stringify(catalog, null, 2) + ';\nif (typeof module !== "undefined") module.exports = catalog;\n');
console.log('Catalog generated with ' + Object.keys(catalog).length + ' items.');
