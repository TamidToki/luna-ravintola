const fs = require('fs');
const path = require('path');

const workspace = '/Users/tahmid_23/Codex Workspace/Luna Ravintola';
const htmlPath = path.join(workspace, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const checkoutHtml = `
            <div id="checkout-form-container" style="display: none; margin-top: 15px; text-align: left; border-top: 1px solid #ccc; padding-top: 15px;">
                <h4 data-en="Order Details" data-fi="Tilaustiedot" style="margin-bottom:10px;">Order Details</h4>
                <div style="margin-bottom: 10px;">
                    <label style="display:block; font-size:14px; margin-bottom:5px;" data-en="Order Type" data-fi="Tilaustyyppi">Order Type</label>
                    <select id="checkout-type" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: var(--light-bg); color: var(--text-color);">
                        <option value="takeaway" data-en="Takeaway" data-fi="Nouto">Takeaway</option>
                        <option value="delivery" data-en="Delivery" data-fi="Kotiinkuljetus">Delivery</option>
                    </select>
                </div>
                <input type="text" id="checkout-name" placeholder="Name / Nimi" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; background: var(--light-bg); color: var(--text-color);">
                <input type="email" id="checkout-email" placeholder="Email / Sähköposti" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; background: var(--light-bg); color: var(--text-color);">
                <input type="tel" id="checkout-phone" placeholder="Phone / Puhelin" required style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; background: var(--light-bg); color: var(--text-color);">
                
                <div id="checkout-address-fields" style="display: none;">
                    <input type="text" id="checkout-address" placeholder="Street Address / Katuosoite" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; background: var(--light-bg); color: var(--text-color);">
                    <input type="text" id="checkout-apartment" placeholder="Apartment/Door / Asunto/Ovi (optional)" style="width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; background: var(--light-bg); color: var(--text-color);">
                </div>
            </div>
            <button id="checkout-btn" class="btn btn-primary w-100 mt-3" disabled>
`;

if (!html.includes('id="checkout-form-container"')) {
    html = html.replace('<button id="checkout-btn" class="btn btn-primary w-100 mt-3" disabled>', checkoutHtml);
}

// Add generic toppings to the Item Modal
const toppingsHtml = `
                <div class="modal-toppings" style="margin-bottom: 25px;">
                    <h4 data-en="Extra Toppings (+2.00€ each)" data-fi="Lisätäytteet (+2.00€ / kpl)">Extra Toppings (+2.00€ each)</h4>
                    <div id="modal-toppings-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">
                        <label><input type="checkbox" value="cheese" data-price="200"> <span data-en="Extra Cheese" data-fi="Lisäjuusto">Extra Cheese</span></label>
                        <label><input type="checkbox" value="pepperoni" data-price="200"> <span data-en="Pepperoni" data-fi="Pepperoni">Pepperoni</span></label>
                        <label><input type="checkbox" value="jalapeno" data-price="200"> <span data-en="Jalapeño" data-fi="Jalapeño">Jalapeño</span></label>
                        <label><input type="checkbox" value="pineapple" data-price="200"> <span data-en="Pineapple" data-fi="Ananas">Pineapple</span></label>
                        <label><input type="checkbox" value="garlic" data-price="100"> <span data-en="Garlic (+1.00€)" data-fi="Valkosipuli (+1.00€)">Garlic (+1.00€)</span></label>
                        <label><input type="checkbox" value="gluten_free" data-price="300"> <span data-en="Gluten-free Base (+3.00€)" data-fi="Gluteeniton pohja (+3.00€)">Gluten-free Base (+3.00€)</span></label>
                    </div>
                </div>
`;

if (!html.includes('id="modal-toppings-list"')) {
    html = html.replace('<div class="modal-quantity">', toppingsHtml + '\n                <div class="modal-quantity">');
}

fs.writeFileSync(htmlPath, html);
console.log('Updated index.html with checkout form and toppings.');
