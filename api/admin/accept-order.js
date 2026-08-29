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
        const { orderId, prepTimeMinutes } = req.body;
        
        if (!orderId || !prepTimeMinutes) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Calculate estimated ready time
        const readyTime = new Date();
        readyTime.setMinutes(readyTime.getMinutes() + prepTimeMinutes);

        const { data, error } = await supabase
            .from('orders')
            .update({ 
                status: 'preparing',
                estimated_ready_time: readyTime.toISOString()
            })
            .eq('id', orderId)
            .select()
            .single();

        if (error) throw error;
        
        // Phase 6: Trigger Email Notification to Customer here
        // sendEmail(data.customer_email, `Your order has been accepted and will be ready in ${prepTimeMinutes} minutes!`);

        res.status(200).json({ success: true, order: data });
    } catch (err) {
        console.error('Error accepting order:', err);
        res.status(500).json({ error: err.message });
    }
}
