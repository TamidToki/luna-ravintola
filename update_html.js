const fs = require('fs');
const path = require('path');

const workspace = '/Users/tahmid_23/Codex Workspace/Luna Ravintola';
const htmlPath = path.join(workspace, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const itemRegex = /<div class="menu-card(?: featured)?">[\s\S]*?<h3 data-en="([^"]+)" data-fi="([^"]+)">.*?<\/h3>([\s\S]*?)<\/div>\s*<\/div>/g;

let newHtml = html;
let offset = 0;

let match;
while ((match = itemRegex.exec(html)) !== null) {
  const name_en = match[1];
  let item_id = name_en.toLowerCase().replace(/ /g, '_').replace(/,/g, '').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/\//g, '_').replace(/-/g, '_');
  
  // Find where this match starts and ends
  const start = match.index;
  const end = match.index + match[0].length;
  
  const originalBlock = match[0];
  
  // Add data-item-id to the main card
  let updatedBlock = originalBlock.replace(/<div class="(menu-card(?: featured)?)"/, `<div class="$1" data-item-id="${item_id}"`);
  
  // Add the button right before the last closing </div>
  const buttonHtml = `
                            <button class="btn btn-primary add-to-cart-btn" data-item-id="${item_id}">
                                <i class="fas fa-cart-plus"></i> <span data-en="Add to Cart" data-fi="Lisää koriin">Add to Cart</span>
                            </button>
                        </div>
                    </div>`;
  
  updatedBlock = updatedBlock.replace(/<\/div>\s*<\/div>$/, buttonHtml);
  
  // Replace in newHtml
  newHtml = newHtml.substring(0, start + offset) + updatedBlock + html.substring(end);
  offset += updatedBlock.length - originalBlock.length;
}

// Ensure the newHtml has the Cart Sidebar and Floating Button before closing body
if (!newHtml.includes('id="cart-sidebar"')) {
    const cartHtml = `
    <!-- Floating Cart Button -->
    <button id="floating-cart-btn" class="floating-cart">
        <i class="fas fa-shopping-cart"></i>
        <span id="cart-count-badge" class="cart-badge">0</span>
    </button>

    <!-- Cart Sidebar -->
    <div id="cart-sidebar" class="cart-sidebar">
        <div class="cart-header">
            <h2 data-en="Your Cart" data-fi="Ostoskorisi">Your Cart</h2>
            <button id="close-cart-btn" class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div id="cart-items" class="cart-items">
            <!-- Items injected by JS -->
        </div>
        <div class="cart-footer">
            <div class="cart-total-row">
                <span data-en="Subtotal" data-fi="Välisumma">Subtotal</span>
                <span id="cart-subtotal">€0.00</span>
            </div>
            <button id="checkout-btn" class="btn btn-primary w-100 mt-3" disabled>
                <span data-en="Proceed to Checkout" data-fi="Siirry kassalle">Proceed to Checkout</span>
            </button>
        </div>
    </div>
    
    <!-- Item Customization Modal -->
    <div id="item-modal-overlay" class="modal-overlay">
        <div class="item-modal">
            <div class="modal-header">
                <h3 id="modal-item-name">Item Name</h3>
                <button id="close-modal-btn" class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div id="modal-sizes-container">
                    <h4 data-en="Select Size" data-fi="Valitse koko">Select Size</h4>
                    <div id="modal-sizes" class="radio-group"></div>
                </div>
                
                <div class="modal-quantity">
                    <h4 data-en="Quantity" data-fi="Määrä">Quantity</h4>
                    <div class="quantity-controls">
                        <button id="qty-minus" class="qty-btn">-</button>
                        <span id="qty-value">1</span>
                        <button id="qty-plus" class="qty-btn">+</button>
                    </div>
                </div>
                
                <div class="modal-notes">
                    <h4 data-en="Special Instructions" data-fi="Erityistoiveet">Special Instructions</h4>
                    <textarea id="modal-notes" rows="2" placeholder="E.g. no onions..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button id="add-to-cart-confirm" class="btn btn-primary w-100">
                    <span data-en="Add to Cart" data-fi="Lisää koriin">Add to Cart</span> - <span id="modal-total-price">€0.00</span>
                </button>
            </div>
        </div>
    </div>
    
    <script src="menu/catalog.js"></script>
    <script src="js/cart.js"></script>
`;
    newHtml = newHtml.replace('</body>', cartHtml + '\n</body>');
}

fs.writeFileSync(htmlPath, newHtml);
console.log('Updated index.html with item IDs, buttons, and cart HTML elements.');
