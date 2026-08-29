const fs = require('fs');
const path = require('path');

const workspace = '/Users/tahmid_23/Codex Workspace/Luna Ravintola';
const cssPath = path.join(workspace, 'styles.css');

const appendCss = `
/* ===== CART & MODAL UI ===== */
.add-to-cart-btn {
    margin-top: 15px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.floating-cart {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: var(--primary-color);
    color: var(--dark-bg);
    border: none;
    font-size: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 15px rgba(255, 107, 0, 0.4);
    cursor: pointer;
    z-index: 99;
    opacity: 0;
    visibility: hidden;
    transform: scale(0.8) translateY(20px);
    transition: all 0.3s ease;
}

.floating-cart.visible {
    opacity: 1;
    visibility: visible;
    transform: scale(1) translateY(0);
}

.floating-cart:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(255, 107, 0, 0.6);
}

.cart-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: #fff;
    color: var(--primary-color);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.dark-mode .cart-badge {
    background-color: var(--dark-bg);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
}

/* Cart Sidebar */
.cart-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 100%;
    max-width: 400px;
    height: 100vh;
    background-color: var(--white);
    box-shadow: -5px 0 25px rgba(0,0,0,0.1);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark-mode .cart-sidebar {
    background-color: var(--dark-card);
    box-shadow: -5px 0 25px rgba(0,0,0,0.5);
}

.cart-sidebar.active {
    right: 0;
}

.cart-header {
    padding: 20px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.dark-mode .cart-header {
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.cart-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-family: 'Playfair Display', serif;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-color);
    cursor: pointer;
    transition: color 0.3s;
}

.close-btn:hover {
    color: var(--primary-color);
}

.cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.cart-empty {
    text-align: center;
    color: #888;
    margin-top: 50px;
    font-style: italic;
}

.cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: 1px dashed rgba(0,0,0,0.1);
}

.dark-mode .cart-item {
    border-bottom: 1px dashed rgba(255,255,255,0.1);
}

.cart-item-info {
    flex: 1;
    padding-right: 15px;
}

.cart-item-title {
    font-weight: 600;
    margin-bottom: 5px;
}

.cart-item-size {
    font-size: 0.85rem;
    color: #777;
}

.cart-item-notes {
    font-size: 0.85rem;
    color: #666;
    margin-bottom: 5px;
    font-style: italic;
}

.dark-mode .cart-item-notes, .dark-mode .cart-item-size {
    color: #aaa;
}

.cart-item-price {
    font-weight: 700;
    color: var(--primary-color);
}

.cart-footer {
    padding: 20px;
    border-top: 1px solid rgba(0,0,0,0.1);
    background-color: var(--light-bg);
}

.dark-mode .cart-footer {
    border-top: 1px solid rgba(255,255,255,0.1);
    background-color: rgba(0,0,0,0.2);
}

.cart-total-row {
    display: flex;
    justify-content: space-between;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 15px;
}

.w-100 { width: 100%; }
.mt-3 { margin-top: 15px; }

/* Item Customization Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.6);
    backdrop-filter: blur(5px);
    z-index: 1100;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.modal-overlay.active {
    opacity: 1;
    visibility: visible;
}

.item-modal {
    background-color: var(--white);
    width: 90%;
    max-width: 500px;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    transform: translateY(30px);
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: 90vh;
}

.dark-mode .item-modal {
    background-color: var(--dark-card);
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}

.modal-overlay.active .item-modal {
    transform: translateY(0);
}

.modal-header {
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    background-color: var(--light-bg);
}

.dark-mode .modal-header {
    border-bottom: 1px solid rgba(255,255,255,0.1);
    background-color: rgba(0,0,0,0.2);
}

.modal-header h3 {
    margin: 0;
    font-family: 'Playfair Display', serif;
    color: var(--primary-color);
}

.modal-body {
    padding: 20px;
    overflow-y: auto;
}

.modal-body h4 {
    margin-top: 0;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.radio-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 25px;
}

.radio-option {
    display: flex;
    align-items: center;
}

.radio-option input[type="radio"] {
    margin-right: 10px;
    accent-color: var(--primary-color);
    width: 18px;
    height: 18px;
}

.radio-option label {
    flex: 1;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    font-size: 1rem;
}

.modal-quantity {
    margin-bottom: 25px;
}

.quantity-controls {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 25px;
    overflow: hidden;
    background: var(--white);
}

.dark-mode .quantity-controls {
    border: 1px solid rgba(255,255,255,0.1);
    background: var(--dark-bg);
}

.quantity-controls.small {
    transform: scale(0.9);
}

.qty-btn {
    background: none;
    border: none;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-color);
    transition: background 0.2s;
}

.qty-btn:hover {
    background: rgba(0,0,0,0.05);
}

.dark-mode .qty-btn:hover {
    background: rgba(255,255,255,0.05);
}

.quantity-controls span {
    width: 30px;
    text-align: center;
    font-weight: 600;
}

.modal-notes textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 8px;
    font-family: inherit;
    resize: vertical;
    background: var(--light-bg);
    color: var(--text-color);
}

.dark-mode .modal-notes textarea {
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(0,0,0,0.2);
}

.modal-notes textarea:focus {
    outline: none;
    border-color: var(--primary-color);
}

.modal-footer {
    padding: 20px;
    border-top: 1px solid rgba(0,0,0,0.1);
}

.dark-mode .modal-footer {
    border-top: 1px solid rgba(255,255,255,0.1);
}
`;

fs.appendFileSync(cssPath, appendCss);
console.log('Appended CSS to styles.css');
