let adminToken = '';
let currentTab = 'active';

// HTML escape utility to prevent XSS from user-supplied data
function esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function adminLogin() {
    const pwd = document.getElementById('admin-password').value;
    if (!pwd) return;
    adminToken = pwd;
    document.getElementById('login-overlay').style.display = 'none';
    
    // Setup tab listeners
    document.getElementById('tab-active').addEventListener('click', () => switchTab('active'));
    document.getElementById('tab-history').addEventListener('click', () => switchTab('history'));
    
    fetchOrders();
    // Poll every 30 seconds
    setInterval(fetchOrders, 30000);
}

function switchTab(tab) {
    currentTab = tab;
    
    const tabActive = document.getElementById('tab-active');
    const tabHistory = document.getElementById('tab-history');
    const containerActive = document.getElementById('orders-container');
    const containerHistory = document.getElementById('history-container');
    
    if (tab === 'active') {
        tabActive.style.color = 'var(--primary)';
        tabActive.style.borderBottom = '2px solid var(--primary)';
        tabHistory.style.color = '#888';
        tabHistory.style.borderBottom = 'none';
        containerActive.style.display = 'block';
        containerHistory.style.display = 'none';
    } else {
        tabHistory.style.color = 'var(--primary)';
        tabHistory.style.borderBottom = '2px solid var(--primary)';
        tabActive.style.color = '#888';
        tabActive.style.borderBottom = 'none';
        containerHistory.style.display = 'block';
        containerActive.style.display = 'none';
    }
    fetchOrders();
}

let currentOrderId = null;

async function fetchOrders() {
    if (!adminToken) return;
    
    const endpoint = currentTab === 'active' ? '/api/admin/orders' : '/api/admin/history';
    const containerId = currentTab === 'active' ? 'orders-container' : 'history-container';
    
    try {
        const response = await fetch(endpoint + "?t=" + Date.now(), { headers: { 'Authorization': 'Bearer ' + adminToken } });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        
        if (currentTab === 'active') {
            renderOrders(orders);
        } else {
            renderHistory(orders);
        }
    } catch (err) {
        console.error(err);
        document.getElementById(containerId).innerHTML = '<p>Error loading orders.</p>';
    }
}

function renderOrders(orders) {
    const container = document.getElementById('orders-container');
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No active orders.</p>';
        return;
    }
    
    orders.forEach(order => {
        const card = document.createElement('div');
        card.className = `order-card status-${esc(order.status)}`;
        
        const date = new Date(order.created_at).toLocaleTimeString();
        
        let itemsHtml = order.order_items.map(item => {
            let desc = `${item.quantity}x ${esc(item.item_name_en)} (${esc(item.size_label_en)})`;
            if (item.toppings && item.toppings.length > 0) {
                desc += `<br><small>+ ${item.toppings.map(t=>esc(t.label_en)).join(', ')}</small>`;
            }
            if (item.special_notes) {
                desc += `<br><small><i>Note: ${esc(item.special_notes)}</i></small>`;
            }
            return `<li>${desc}</li>`;
        }).join('');

        let actionsHtml = '';
        if (order.status === 'paid') {
            actionsHtml = `<button class="btn btn-accept" onclick="openAcceptModal('${esc(order.id)}')">Accept Order</button>`;
        } else if (order.status === 'preparing') {
            actionsHtml = `<button class="btn btn-ready" onclick="updateOrderStatus('${esc(order.id)}', 'ready')">Mark Ready to Deliver/Pickup</button>`;
        } else if (order.status === 'ready') {
            if (order.type === 'delivery') {
                actionsHtml = `<button class="btn" style="background:#2196F3;" onclick="updateOrderStatus('${esc(order.id)}', 'in_delivery')">Out for Delivery</button>`;
            } else {
                actionsHtml = `<button class="btn" style="background:#888;" onclick="updateOrderStatus('${esc(order.id)}', 'completed')">Complete Order</button>`;
            }
        } else if (order.status === 'in_delivery') {
            actionsHtml = `<button class="btn" style="background:#888;" onclick="updateOrderStatus('${esc(order.id)}', 'completed')">Complete Delivery</button>`;
        }

        const addressHtml = order.type === 'delivery' 
            ? `<p><strong>Delivery:</strong> ${esc(order.delivery_address)} ${esc(order.delivery_apartment)}</p>`
            : `<p><strong>Takeaway</strong></p>`;

        card.innerHTML = `
            <div class="order-header">
                <span class="order-id">#${esc(order.id.split('-')[0].toUpperCase())} - Status: ${esc(order.status.toUpperCase())}</span>
                <span class="order-time">${date}</span>
            </div>
            <div class="order-body">
                <div class="customer-info">
                    <h3>${esc(order.customer_name)}</h3>
                    <p>${esc(order.customer_phone)}</p>
                    <p>${esc(order.customer_email)}</p>
                    ${addressHtml}
                    ${order.customer_notes ? `<p><em>Note: ${esc(order.customer_notes)}</em></p>` : ''}
                    <h4 style="margin-top:10px;">Total: €${(order.total_amount / 100).toFixed(2)}</h4>
                </div>
                <div class="order-items">
                    <ul>${itemsHtml}</ul>
                </div>
                <div class="order-actions">
                    ${actionsHtml}
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function renderHistory(orders) {
    const container = document.getElementById('history-container');
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No history available.</p>';
        return;
    }
    
    // Group by date
    const grouped = {};
    orders.forEach(o => {
        const d = new Date(o.created_at).toLocaleDateString();
        if(!grouped[d]) grouped[d] = [];
        grouped[d].push(o);
    });
    
    for (const [dateStr, dailyOrders] of Object.entries(grouped)) {
        const dateSection = document.createElement('div');
        dateSection.style.marginBottom = '30px';
        
        let deliveries = 0;
        let takeaways = 0;
        let totalRevenue = 0;
        
        dailyOrders.forEach(o => {
            if (o.type === 'delivery') deliveries++;
            else takeaways++;
            totalRevenue += o.total_amount;
        });
        
        dateSection.innerHTML = `
            <h3 style="border-bottom: 1px solid #ccc; padding-bottom: 5px;">${dateStr}</h3>
            <div style="display:flex; gap:20px; margin-bottom: 15px; font-weight:bold; color:#555;">
                <span>Total Orders: ${dailyOrders.length}</span>
                <span>Deliveries: ${deliveries}</span>
                <span>Takeaways: ${takeaways}</span>
                <span style="color:var(--primary);">Revenue: €${(totalRevenue/100).toFixed(2)}</span>
            </div>
        `;
        
        // Render a compact list of orders
        dailyOrders.forEach(order => {
            const time = new Date(order.created_at).toLocaleTimeString();
            const typeStr = order.type === 'delivery' ? '🚗 Delivery' : '🛍️ Takeaway';
            dateSection.innerHTML += `
                <div style="padding: 10px; background: white; margin-bottom: 5px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); display:flex; justify-content:space-between;">
                    <span><strong>#${esc(order.id.split('-')[0].toUpperCase())}</strong> - ${esc(order.customer_name)}</span>
                    <span>${typeStr}</span>
                    <span>${time}</span>
                    <span style="font-weight:bold;">€${(order.total_amount/100).toFixed(2)}</span>
                </div>
            `;
        });
        
        container.appendChild(dateSection);
    }
}

function openAcceptModal(orderId) {
    currentOrderId = orderId;
    document.getElementById('accept-modal').style.display = 'flex';
}

document.getElementById('cancel-accept-btn').addEventListener('click', () => {
    document.getElementById('accept-modal').style.display = 'none';
    currentOrderId = null;
});

document.getElementById('confirm-accept-btn').addEventListener('click', async () => {
    if (!currentOrderId) return;
    
    const prepTime = document.getElementById('prep-time').value;
    
    try {
        const response = await fetch('/api/admin/accept-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
            body: JSON.stringify({ orderId: currentOrderId, prepTimeMinutes: parseInt(prepTime) })
        });
        
        if (response.ok) {
            document.getElementById('accept-modal').style.display = 'none';
            fetchOrders();
        } else {
            alert('Failed to accept order');
        }
    } catch (err) {
        console.error(err);
        alert('Error accepting order');
    }
});

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch('/api/admin/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
            body: JSON.stringify({ orderId, status })
        });
        
        if (response.ok) {
            fetchOrders();
        } else {
            alert('Failed to update status');
        }
    } catch (err) {
        console.error(err);
        alert('Error updating status');
    }
}
