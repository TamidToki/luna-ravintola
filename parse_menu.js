const fs = require('fs');
const path = require('path');

const workspace = '/Users/tahmid_23/Codex Workspace/Luna Ravintola';
const html = fs.readFileSync(path.join(workspace, 'index.html'), 'utf-8');

const categories = [];
let match;
const catRegex = /<div class="menu-category(?: active)?" id="([^"]+)">([\s\S]*?)<!-- =====/g;
while ((match = catRegex.exec(html)) !== null) {
  categories.push({ id: match[1], html: match[2] });
}

// Add the last category
const lastCatRegex = /<div class="menu-category" id="drinks">([\s\S]*?)<\/section>/;
const lastCatMatch = lastCatRegex.exec(html);
if (lastCatMatch) {
  categories.push({ id: 'drinks', html: lastCatMatch[1] });
}

const catalog = {};

categories.forEach(cat => {
  const itemRegex = /<h3 data-en="([^"]+)" data-fi="([^"]+)">.*?<\/h3>/g;
  let itemMatch;
  while ((itemMatch = itemRegex.exec(cat.html)) !== null) {
    const name_en = itemMatch[1];
    const name_fi = itemMatch[2];
    
    let item_id = name_en.toLowerCase().replace(/ /g, '_').replace(/,/g, '').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/\//g, '_').replace(/-/g, '_');
    
    // Find the end of this item block
    const startPos = itemRegex.lastIndex;
    const nextH3Match = /<h3/.exec(cat.html.substring(startPos));
    const endPos = nextH3Match ? startPos + nextH3Match.index : cat.html.length;
    const chunk = cat.html.substring(startPos, endPos);
    
    const descRegex = /<p data-en="([^"]+)" data-fi="([^"]+)">/;
    const descMatch = descRegex.exec(chunk);
    const desc_en = descMatch ? descMatch[1] : "";
    const desc_fi = descMatch ? descMatch[2] : "";
    
    const dualPriceRegex = /<div class="dual-price"><span class="price">Norm\. €([0-9.]+)<\/span><span[^>]*>Perhe €([0-9.]+)<\/span><\/div>/;
    const dualPriceMatch = dualPriceRegex.exec(chunk);
    
    const singlePriceRegex = /<span class="price">€([0-9.]+)<\/span>/;
    let singlePriceMatch = singlePriceRegex.exec(chunk);
    if (!singlePriceMatch) {
       singlePriceMatch = singlePriceRegex.exec(cat.html.substring(itemMatch.index - 50, itemMatch.index));
    }
    
    const sizes = {};
    if (dualPriceMatch) {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: Math.round(parseFloat(dualPriceMatch[1]) * 100) };
      sizes.family = { label_en: "Family", label_fi: "Perhe", price: Math.round(parseFloat(dualPriceMatch[2]) * 100) };
    } else if (singlePriceMatch) {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: Math.round(parseFloat(singlePriceMatch[1]) * 100) };
    } else {
      sizes.norm = { label_en: "Normal", label_fi: "Normaali", price: 0 };
    }
    
    catalog[item_id] = {
      id: item_id,
      category: cat.id,
      name_en: name_en,
      name_fi: name_fi,
      desc_en: desc_en,
      desc_fi: desc_fi,
      sizes: sizes
    };
  }
});

const menuDir = path.join(workspace, 'menu');
if (!fs.existsSync(menuDir)) {
  fs.mkdirSync(menuDir);
}

fs.writeFileSync(path.join(menuDir, 'catalog.js'), 'const catalog = ' + JSON.stringify(catalog, null, 2) + ';\n');
console.log('Catalog generated with ' + Object.keys(catalog).length + ' items.');
