const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (!process.env.ADMIN_PASSWORD || req.headers.authorization !== 'Bearer ' + process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Note: In production, verify the admin session cookie or header here.
    // Since this is MVP Phase 5, we assume network-level or basic protection.
    
    try {
        // Fetch active orders (not pending or completed/cancelled if you only want active ones, 
        // but let's fetch all paid, preparing, and ready orders)
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (*)
            `)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch order history' });
    }
}
