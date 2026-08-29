const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body to verify signatures
  },
};

// Helper function to read raw body
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (!sig || !webhookSecret) return res.status(400).send(`Webhook Error: Missing signature or secret`);
        event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
    } catch (err) {
        console.error(`Webhook signature verification failed:`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const orderId = session.metadata.orderId;

            if (orderId) {
                // Update order to paid
                const { error } = await supabase
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('id', orderId);

                if (error) {
                    console.error('Error updating order status in Supabase:', error);
                    return res.status(500).json({ error: 'Database update failed' });
                }
                
                console.log(`Order ${orderId} successfully updated to 'paid'.`);
                // Here we would also trigger the email notification in Phase 6
            }
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
