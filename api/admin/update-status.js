const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Valid status transitions
const ALLOWED_TRANSITIONS = {
    'paid': ['preparing'],
    'preparing': ['ready'],
    'ready': ['in_delivery', 'completed'],
    'in_delivery': ['completed']
};

export default async function handler(req, res) {
    if (!process.env.ADMIN_PASSWORD || req.headers.authorization !== 'Bearer ' + process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate the target status is a known value
        const validStatuses = ['preparing', 'ready', 'in_delivery', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Fetch current order to validate transition
        const { data: currentOrder, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (fetchError || !currentOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const allowed = ALLOWED_TRANSITIONS[currentOrder.status];
        if (!allowed || !allowed.includes(status)) {
            return res.status(400).json({ error: `Cannot transition from '${currentOrder.status}' to '${status}'` });
        }

        // Build update payload
        const updateData = { status };
        if (status === 'completed') {
            updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ success: true, order: data });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
}
