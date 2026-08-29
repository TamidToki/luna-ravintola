let adminToken = '';

function adminLogin() {
    const pwd = document.getElementById('admin-password').value;
    if (!pwd) return;
    adminToken = pwd;
    document.getElementById('login-overlay').style.display = 'none';
    fetchOrders();
}

let currentOrderId = null;

async function fetchOrders() {
    try {
        const response = await fetch('/api/admin/orders', { headers: { 'Authorization': 'Bearer ' + adminToken } });
        if (!response.ok) throw new Error('Failed to fetch orders');
        const orders = await response.json();
        renderOrders(orders);
    } catch (err) {
        console.error(err);
        document.getElementById('orders-container').innerHTML = '<p>Error loading orders.</p>';
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
        card.className = `order-card status-${order.status}`;
        
        const date = new Date(order.created_at).toLocaleTimeString();
        
        let itemsHtml = order.order_items.map(item => {
            let desc = `${item.quantity}x ${item.item_name_en} (${item.size_label_en})`;
            if (item.toppings && item.toppings.length > 0) {
                desc += `<br><small>+ ${item.toppings.map(t=>t.label_en).join(', ')}</small>`;
            }
            if (item.special_notes) {
                desc += `<br><small><i>Note: ${item.special_notes}</i></small>`;
            }
            return `<li>${desc}</li>`;
        }).join('');

        let actionsHtml = '';
        if (order.status === 'paid') {
            actionsHtml = `<button class="btn btn-accept" onclick="openAcceptModal('${order.id}')">Accept Order</button>`;
        } else if (order.status === 'preparing') {
            actionsHtml = `<button class="btn btn-ready" onclick="updateOrderStatus('${order.id}', 'ready')">Mark Ready/Out for Delivery</button>`;
        } else if (order.status === 'ready') {
            actionsHtml = `<button class="btn" style="background:#888;" onclick="updateOrderStatus('${order.id}', 'completed')">Mark Completed</button>`;
        }

        const addressHtml = order.type === 'delivery' 
            ? `<p><strong>Delivery:</strong> ${order.delivery_address} ${order.delivery_apartment || ''}</p>`
            : `<p><strong>Takeaway</strong></p>`;

        card.innerHTML = `
            <div class="order-header">
                <span class="order-id">#${order.id.split('-')[0].toUpperCase()} - Status: ${order.status.toUpperCase()}</span>
                <span class="order-time">${date}</span>
            </div>
            <div class="order-body">
                <div class="customer-info">
                    <h3>${order.customer_name}</h3>
                    <p>${order.customer_phone}</p>
                    <p>${order.customer_email}</p>
                    ${addressHtml}
                    ${order.customer_notes ? `<p><em>Note: ${order.customer_notes}</em></p>` : ''}
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
            fetchOrders(); // Reload orders
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

// Initial fetch


// In a real app with Supabase, we would initialize Supabase Realtime here
// to listen to INSERTS and UPDATES on the 'orders' table to auto-refresh.
// setInterval(fetchOrders, 30000); // Polling fallback
