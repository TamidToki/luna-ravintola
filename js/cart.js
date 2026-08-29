const STANDARD_TOPPINGS = [
    { value: 'pineapple', en: 'Pineapple', fi: 'Ananas' },
    { value: 'blue_cheese', en: 'Blue cheese', fi: 'Aurajuusto' },
    { value: 'egg', en: 'Egg', fi: 'Kananmuna' },
    { value: 'bbq_sauce', en: 'BBQ sauce', fi: 'BBQ-kastike' },
    { value: 'feta', en: 'Feta cheese', fi: 'Fetajuusto' },
    { value: 'mushroom', en: 'Mushroom', fi: 'Herkkusieni' },
    { value: 'jalapeno', en: 'Jalapeño', fi: 'Jalapeño' },
    { value: 'cheese', en: 'Cheese', fi: 'Juusto' },
    { value: 'mozzarella', en: 'Mozzarella', fi: 'Mozzarella' },
    { value: 'olive', en: 'Olive', fi: 'Oliivi' },
    { value: 'paprika', en: 'Paprika', fi: 'Paprika' },
    { value: 'red_onion', en: 'Red onion', fi: 'Punasipuli' },
    { value: 'onion', en: 'Onion', fi: 'Sipuli' },
    { value: 'pickle', en: 'Pickle', fi: 'Suolakurkku' },
    { value: 'tomato', en: 'Tomato', fi: 'Tomaatti' },
    { value: 'double_cheese', en: 'Double cheese', fi: 'Tuplajuusto' },
    { value: 'turkish_pepper', en: 'Turkish pepper', fi: 'Turkinpippuri' },
    { value: 'garlic', en: 'Garlic', fi: 'Valkosipuli' },
    { value: 'cherry_tomato', en: 'Cherry tomato', fi: 'Kirsikkatomaatti' }
];

const PREMIUM_TOPPINGS = [
    { value: 'minced_meat', en: 'Minced meat', fi: 'Jauheliha' },
    { value: 'chicken', en: 'Chicken', fi: 'Kana' },
    { value: 'shrimp', en: 'Shrimp', fi: 'Katkarapu' },
    { value: 'kebab', en: 'Kebab', fi: 'Kebab' },
    { value: 'ham', en: 'Ham', fi: 'Kinkku' },
    { value: 'pepperoni', en: 'Pepperoni', fi: 'Pepperoni' },
    { value: 'salami', en: 'Salami', fi: 'Salami' },
    { value: 'mussel', en: 'Mussel', fi: 'Simpukka' },
    { value: 'tuna', en: 'Tuna', fi: 'Tonnikala' },
    { value: 'bacon', en: 'Bacon', fi: 'Pekoni' }
];

const Cart = {
    items: [],
    
    init() {
        const stored = localStorage.getItem('luna_cart');
        if (stored) {
            try {
                this.items = JSON.parse(stored);
            } catch (e) {
                this.items = [];
            }
        }
        
        this.bindEvents();
        this.updateUI();
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('cart_cancelled') === 'true') {
            alert(currentLang === 'en' ? 'Checkout was cancelled.' : 'Kassatapahtuma peruutettiin.');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            this.updateUI();
            setTimeout(() => Sidebar.open(), 500);
        }

    },
    
    save() {
        localStorage.setItem('luna_cart', JSON.stringify(this.items));
        this.updateUI();
    },
    
    addItem(item) {
        const toppingsStr = JSON.stringify(item.toppings);
        const existing = this.items.find(i => 
            i.id === item.id && 
            i.size === item.size && 
            i.notes === item.notes &&
            JSON.stringify(i.toppings) === toppingsStr
        );
        
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            this.items.push(item);
        }
        this.save();
    },
    
    removeItem(index) {
        this.items.splice(index, 1);
        this.save();
    },
    
    updateQuantity(index, delta) {
        const item = this.items[index];
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeItem(index);
            } else {
                this.save();
            }
        }
    },
    
    getSubtotal() {
        return this.items.reduce((sum, item) => {
            const toppingTotal = item.toppings.reduce((tsum, t) => tsum + t.price, 0);
            return sum + ((item.price + toppingTotal) * item.quantity);
        }, 0);
    },
    
    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },
    
    bindEvents() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.itemId;
                Modal.open(id);
            });
        });
        
        const floatingBtn = document.getElementById('floating-cart-btn');
        if(floatingBtn) floatingBtn.addEventListener('click', () => Sidebar.open());
        
        const closeSidebarBtn = document.getElementById('close-cart-btn');
        if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => Sidebar.close());
        
        const checkoutType = document.getElementById('checkout-type');
        const addressFields = document.getElementById('checkout-address-fields');
        if (checkoutType && addressFields) {
            checkoutType.addEventListener('change', (e) => {
                if (e.target.value === 'delivery') {
                    addressFields.style.display = 'block';
                    document.getElementById('checkout-address').required = true;
                } else {
                    addressFields.style.display = 'none';
                    document.getElementById('checkout-address').required = false;
                }
            });
        }
        
        const checkoutBtn = document.getElementById('checkout-btn');
        if(checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                const name = document.getElementById('checkout-name').value.trim();
                const email = document.getElementById('checkout-email').value.trim();
                const phone = document.getElementById('checkout-phone').value.trim();
                const type = document.getElementById('checkout-type').value;
                const address = document.getElementById('checkout-address').value.trim();
                const aptEl = document.getElementById('checkout-apartment');
                const apt = aptEl ? aptEl.value.trim() : '';
                
                const notesEl = document.getElementById('checkout-notes');
                const notes = notesEl ? notesEl.value.trim() : '';
                
                if (!name || !email || !phone) {
                    alert(currentLang === 'en' ? 'Please fill in Name, Email, and Phone.' : 'Täytä nimi, sähköposti ja puhelinnumero.');
                    return;
                }
                
                if (type === 'delivery' && !address) {
                    alert(currentLang === 'en' ? 'Please provide a delivery address.' : 'Anna toimitusosoite.');
                    return;
                }
                
                const orderData = {
                    customer: { name, email, phone, type, address, apt, notes },
                    items: this.items
                };
                
                checkoutBtn.disabled = true;
                const originalText = checkoutBtn.innerHTML;
                checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                
                fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    if (data.url) {
                        window.location.href = data.url;
                    } else {
                        throw new Error('No checkout URL returned');
                    }
                })
                .catch(err => {
                    console.error('Checkout error:', err);
                    alert(currentLang === 'en' ? 'Failed to create checkout session. Please try again.' : 'Kassalle siirtyminen epäonnistui. Yritä uudelleen.');
                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = originalText;
                });
            });
        }
    },
    
    updateUI() {
        const count = this.getTotalItems();
        const badge = document.getElementById('cart-count-badge');
        if(badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
        
        const floatingBtn = document.getElementById('floating-cart-btn');
        if (floatingBtn) {
            if (count > 0) floatingBtn.classList.add('visible');
            else floatingBtn.classList.remove('visible');
        }
        
        Sidebar.renderItems();
    }
};

const Modal = {
    currentItem: null,
    currentSize: 'norm',
    quantity: 1,
    
    init() {
        this.overlay = document.getElementById('item-modal-overlay');
        this.closeBtn = document.getElementById('close-modal-btn');
        this.minusBtn = document.getElementById('qty-minus');
        this.plusBtn = document.getElementById('qty-plus');
        this.qtyValue = document.getElementById('qty-value');
        this.addBtn = document.getElementById('add-to-cart-confirm');
        
        if (!this.overlay) return;
        
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        
        this.minusBtn.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                this.updateDisplay();
            }
        });
        
        this.plusBtn.addEventListener('click', () => {
            this.quantity++;
            this.updateDisplay();
        });
        
        // Listen to topping changes
        const toppingsContainer = document.getElementById('modal-toppings-list');
        if (toppingsContainer) {
            toppingsContainer.addEventListener('change', () => this.updateDisplay());
        }
        
        this.addBtn.addEventListener('click', () => {
            if (!this.currentItem) return;
            
            const sizeData = catalog[this.currentItem].sizes[this.currentSize];
            const notes = document.getElementById('modal-notes').value.trim();
            
            const selectedToppings = [];
            document.querySelectorAll('#modal-toppings-list input[type="checkbox"]:checked').forEach(cb => {
                selectedToppings.push({
                    id: cb.value,
                    price: parseInt(cb.dataset.price, 10),
                    label_en: cb.dataset.nameEn || cb.nextElementSibling.dataset.en,
                    label_fi: cb.dataset.nameFi || cb.nextElementSibling.dataset.fi
                });
            });
            
            Cart.addItem({
                id: this.currentItem,
                name_en: catalog[this.currentItem].name_en,
                name_fi: catalog[this.currentItem].name_fi,
                size: this.currentSize,
                sizeLabel_en: sizeData.label_en,
                sizeLabel_fi: sizeData.label_fi,
                price: sizeData.price, // cents
                toppings: selectedToppings,
                quantity: this.quantity,
                notes: notes
            });
            
            this.close();
            Sidebar.open();
        });
        
        const langToggle = document.getElementById('lang-toggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                setTimeout(() => {
                    if (this.overlay.classList.contains('active')) {
                        this.updateDisplay();
                    }
                    Sidebar.renderItems();
                }, 10);
            });
        }
    },
    
    open(itemId) {
        if (!catalog[itemId]) return;
        
        this.currentItem = itemId;
        this.quantity = 1;
        document.getElementById('modal-notes').value = '';
        document.querySelectorAll('#modal-toppings-list input[type="checkbox"]').forEach(cb => cb.checked = false);
        
        const item = catalog[itemId];
        
        const sizesContainer = document.getElementById('modal-sizes');
        sizesContainer.innerHTML = '';
        
        let firstSize = null;
        for (const [sizeKey, sizeObj] of Object.entries(item.sizes)) {
            if (!firstSize) firstSize = sizeKey;
            
            const div = document.createElement('div');
            div.className = 'radio-option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'item-size';
            input.value = sizeKey;
            input.id = 'size-' + sizeKey;
            input.addEventListener('change', (e) => {
                this.currentSize = e.target.value;
                this.updateDisplay();
            });
            
            const label = document.createElement('label');
            label.htmlFor = 'size-' + sizeKey;
            
            const priceFormatted = (sizeObj.price / 100).toFixed(2) + '€';
            const sizeName = currentLang === 'en' ? sizeObj.label_en : sizeObj.label_fi;
            
            label.innerHTML = `<span>${sizeName}</span><span>${priceFormatted}</span>`;
            
            div.appendChild(input);
            div.appendChild(label);
            sizesContainer.appendChild(div);
        }
        
        this.currentSize = firstSize;
        const firstRadio = sizesContainer.querySelector('input');
        if(firstRadio) firstRadio.checked = true;
        
        // Handle toppings container visibility and generation
        const toppingsContainer = document.getElementById('modal-toppings-container');
        const toppingsList = document.getElementById('modal-toppings-list');
        
        if (toppingsContainer && toppingsList) {
            if (item.category === 'pizza') {
                toppingsContainer.style.display = 'block';
                this.renderToppings();
            } else {
                toppingsContainer.style.display = 'none';
                toppingsList.innerHTML = '';
            }
        }
        
        this.updateDisplay();
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    renderToppings() {
        const toppingsList = document.getElementById('modal-toppings-list');
        if (!toppingsList) return;
        
        // Save checked state before re-rendering
        const checkedToppings = new Set(Array.from(toppingsList.querySelectorAll('input:checked')).map(cb => cb.value));
        
        toppingsList.innerHTML = '';
        
        const standardPrice = this.currentSize === 'family' ? 200 : 100;
        const premiumPrice = this.currentSize === 'family' ? 350 : 200;
        
        const renderGroup = (toppings, price) => {
            toppings.forEach(t => {
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.value = t.value;
                input.dataset.price = price;
                input.dataset.nameEn = t.en;
                input.dataset.nameFi = t.fi;
                
                if (checkedToppings.has(t.value)) {
                    input.checked = true;
                }
                
                input.addEventListener('change', () => this.updateDisplay());
                
                const span = document.createElement('span');
                span.dataset.en = `${t.en} (+${(price/100).toFixed(2)}€)`;
                span.dataset.fi = `${t.fi} (+${(price/100).toFixed(2)}€)`;
                span.textContent = currentLang === 'en' ? span.dataset.en : span.dataset.fi;
                
                label.appendChild(input);
                label.appendChild(document.createTextNode(' '));
                label.appendChild(span);
                toppingsList.appendChild(label);
            });
        };
        
        renderGroup(STANDARD_TOPPINGS, standardPrice);
        renderGroup(PREMIUM_TOPPINGS, premiumPrice);
    },
    
    updateDisplay() {
        if (!this.currentItem) return;
        
        const item = catalog[this.currentItem];
        const titleEl = document.getElementById('modal-item-name');
        titleEl.textContent = currentLang === 'en' ? item.name_en : item.name_fi;
        
        this.qtyValue.textContent = this.quantity;
        
        const sizeData = item.sizes[this.currentSize];
        
        let toppingTotal = 0;
        document.querySelectorAll('#modal-toppings-list input[type="checkbox"]:checked').forEach(cb => {
            toppingTotal += parseInt(cb.dataset.price, 10);
        });
        
        const totalCents = (sizeData.price + toppingTotal) * this.quantity;
        document.getElementById('modal-total-price').textContent = '€' + (totalCents / 100).toFixed(2);
        
        const radios = document.querySelectorAll('#modal-sizes .radio-option');
        let i = 0;
        for (const [sizeKey, sizeObj] of Object.entries(item.sizes)) {
            if (radios[i]) {
                const label = radios[i].querySelector('label span');
                if (label) {
                    label.textContent = currentLang === 'en' ? sizeObj.label_en : sizeObj.label_fi;
                }
            }
            i++;
        }
        
        if (item.category === 'pizza') {
            this.renderToppings();
        }
    },
    
    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.currentItem = null;
    }
};

const Sidebar = {
    init() {
        this.element = document.getElementById('cart-sidebar');
        this.backdrop = document.getElementById('cart-backdrop');
        
        // Click anywhere on the backdrop to close the cart
        if (this.backdrop) {
            this.backdrop.addEventListener('click', () => this.close());
        }
    },
    
    open() {
        if(!this.element) return;
        this.element.classList.add('active');
        if (this.backdrop) this.backdrop.classList.add('active');
        const mobileMenu = document.querySelector('.mobile-menu-overlay');
        if (mobileMenu) mobileMenu.classList.remove('active');
        
        const formContainer = document.getElementById('checkout-form-container');
        if (Cart.items.length > 0) {
            formContainer.style.display = 'block';
        } else {
            formContainer.style.display = 'none';
        }
    },
    
    close() {
        if(!this.element) return;
        this.element.classList.remove('active');
        if (this.backdrop) this.backdrop.classList.remove('active');
    },
    
    renderItems() {
        const container = document.getElementById('cart-items');
        if(!container) return;
        
        container.innerHTML = '';
        const formContainer = document.getElementById('checkout-form-container');
        
        if (Cart.items.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'cart-empty';
            emptyMsg.textContent = currentLang === 'en' ? 'Your cart is empty' : 'Ostoskorisi on tyhjä';
            container.appendChild(emptyMsg);
            
            document.getElementById('checkout-btn').disabled = true;
            document.getElementById('cart-subtotal').textContent = '€0.00';
            if (formContainer) formContainer.style.display = 'none';
            return;
        }
        
        document.getElementById('checkout-btn').disabled = false;
        if (formContainer) formContainer.style.display = 'block';
        
        Cart.items.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            
            const name = currentLang === 'en' ? item.name_en : item.name_fi;
            const sizeLabel = currentLang === 'en' ? item.sizeLabel_en : item.sizeLabel_fi;
            
            const toppingTotal = item.toppings.reduce((sum, t) => sum + t.price, 0);
            const total = (((item.price + toppingTotal) * item.quantity) / 100).toFixed(2);
            
            let toppingsHtml = '';
            if (item.toppings && item.toppings.length > 0) {
                const tNames = item.toppings.map(t => currentLang === 'en' ? t.label_en : t.label_fi).join(', ');
                toppingsHtml = `<div class="cart-item-notes" style="margin-top:2px; font-size:0.8rem;">+ ${tNames}</div>`;
            }
            
            let notesHtml = '';
            if (item.notes) {
                notesHtml = `<div class="cart-item-notes" style="margin-top:4px;"><i class="fas fa-comment-alt"></i> ${item.notes}</div>`;
            }
            
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${name} <span class="cart-item-size">(${sizeLabel})</span></div>
                    ${toppingsHtml}
                    ${notesHtml}
                    <div class="cart-item-price" style="margin-top:4px;">€${total}</div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls small">
                        <button class="qty-btn minus-btn" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn plus-btn" data-index="${index}">+</button>
                    </div>
                </div>
            `;
            
            container.appendChild(itemEl);
        });
        
        container.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                Cart.updateQuantity(parseInt(e.target.dataset.index), -1);
            });
        });
        
        container.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                Cart.updateQuantity(parseInt(e.target.dataset.index), 1);
            });
        });
        
        const subtotal = (Cart.getSubtotal() / 100).toFixed(2);
        document.getElementById('cart-subtotal').textContent = '€' + subtotal;
        
        // Update form translations
        document.querySelectorAll('#checkout-form-container [data-en]').forEach(el => {
            if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
                el.placeholder = currentLang === 'en' ? el.dataset.en : el.dataset.fi;
            } else {
                el.textContent = currentLang === 'en' ? el.dataset.en : el.dataset.fi;
            }
        });
        const nameInp = document.getElementById('checkout-name');
        if (nameInp) nameInp.placeholder = currentLang === 'en' ? 'Name' : 'Nimi';
        const emailInp = document.getElementById('checkout-email');
        if (emailInp) emailInp.placeholder = currentLang === 'en' ? 'Email' : 'Sähköposti';
        const phoneInp = document.getElementById('checkout-phone');
        if (phoneInp) phoneInp.placeholder = currentLang === 'en' ? 'Phone' : 'Puhelin';
        const addressInp = document.getElementById('checkout-address');
        if (addressInp) addressInp.placeholder = currentLang === 'en' ? 'Street Address' : 'Katuosoite';
        const aptInp = document.getElementById('checkout-apartment');
        if (aptInp) aptInp.placeholder = currentLang === 'en' ? 'Apartment (optional)' : 'Asunto/Ovi (valinnainen)';
        const notesInp = document.getElementById('checkout-notes');
        if (notesInp) notesInp.placeholder = currentLang === 'en' ? 'Delivery/Order Notes' : 'Tilausohjeet';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
    Modal.init();
    Sidebar.init();
});
