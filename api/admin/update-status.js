const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.headers.authorization !== 'Bearer ' + process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' });
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId, status } = req.body;
        
        if (!orderId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Allowed manual transitions: preparing -> ready, ready -> completed
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        
        // Phase 6: Trigger Email Notification to Customer here (e.g. "Order Ready!")

        res.status(200).json({ success: true, order: data });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: err.message });
    }
}
