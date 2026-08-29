const fs = require('fs');

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf-8');

// Regex to find menu-list-item blocks
// It matches: <div class="menu-list-item"> ... <h4 data-en="NAME" ...> ... </h4> ... <div class="item-prices"> ... </div></div>
const regex = /<div class="menu-list-item">([\s\S]*?)<h4 data-en="([^"]+)" data-fi="([^"]+)">.*?<\/h4>([\s\S]*?)<div class="item-prices">([\s\S]*?)<\/div>\s*<\/div>/g;

let newHtml = html;
let offset = 0;
let match;
let count = 0;

while ((match = regex.exec(html)) !== null) {
    const name_en = match[2];
    // create id
    let item_id = name_en.toLowerCase().replace(/ /g, '_').replace(/,/g, '').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/\//g, '_').replace(/-/g, '_').replace(/[^\w]/g, '');
    
    // Some names like "With French Fries" are generic, so we'll append the index to make them completely unique for the catalog mapping
    item_id = item_id + '_' + count;
    
    const start = match.index;
    const end = match.index + match[0].length;
    
    const originalBlock = match[0];
    
    let updatedBlock = originalBlock.replace('<div class="menu-list-item">', `<div class="menu-list-item" data-item-id="${item_id}">`);
    
    // Add button next to price inside item-prices
    updatedBlock = updatedBlock.replace(/<div class="item-prices">([\s\S]*?)<\/div>/, `<div class="item-prices" style="display:flex; align-items:center;">$1<button class="btn btn-primary add-to-cart-btn" data-item-id="${item_id}" style="margin-left: 15px; padding: 4px 10px; font-size: 0.8rem; border-radius: 4px; display:inline-block;"><i class="fas fa-cart-plus"></i> <span data-en="Add" data-fi="Lisää">Add</span></button></div>`);
    
    newHtml = newHtml.substring(0, start + offset) + updatedBlock + html.substring(end);
    offset += updatedBlock.length - originalBlock.length;
    count++;
}

fs.writeFileSync(htmlPath, newHtml);
console.log('Injected buttons to ' + count + ' list items.');
