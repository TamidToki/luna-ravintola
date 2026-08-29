const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const catalog = require('../menu/catalog.js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { customer, items } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        // 1. Calculate the real subtotal from backend catalog to prevent tampering
        let calculatedSubtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const catalogItem = catalog[item.id];
            if (!catalogItem) {
                throw new Error(`Item ${item.id} not found in catalog.`);
            }

            const sizeData = catalogItem.sizes[item.size];
            if (!sizeData) {
                throw new Error(`Size ${item.size} not valid for item ${item.id}.`);
            }

            // Verify toppings
            let toppingTotal = 0;
            const validToppings = [];
            if (item.toppings && Array.isArray(item.toppings)) {
                for (const t of item.toppings) {
                    // Standard topping logic (hardcoded in html for now: 200 cents, except garlic 100, gluten_free 300)
                    let tPrice = 200;
                    if (t.id === 'garlic') tPrice = 100;
                    if (t.id === 'gluten_free') tPrice = 300;
                    
                    toppingTotal += tPrice;
                    validToppings.push({
                        id: t.id,
                        label_en: t.label_en,
                        label_fi: t.label_fi,
                        price: tPrice
                    });
                }
            }

            const unitPrice = sizeData.price + toppingTotal;
            calculatedSubtotal += unitPrice * item.quantity;

            orderItems.push({
                item_id: item.id,
                item_name_en: catalogItem.name_en,
                item_name_fi: catalogItem.name_fi,
                size_id: item.size,
                size_label_en: sizeData.label_en,
                size_label_fi: sizeData.label_fi,
                quantity: item.quantity,
                unit_price: unitPrice,
                toppings: validToppings,
                special_notes: item.notes || null
            });
        }

        // Add 5.00€ delivery fee if it's delivery
        const deliveryFee = customer.type === 'delivery' ? 500 : 0;
        const totalAmount = calculatedSubtotal + deliveryFee;

        // 2. Insert order into Supabase
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                type: customer.type,
                delivery_address: customer.address || null,
                delivery_apartment: customer.apt || null,
                customer_notes: customer.notes || null,
                status: 'pending',
                total_amount: totalAmount,
                delivery_fee: deliveryFee
            })
            .select()
            .single();

        if (orderError) throw orderError;
        const orderId = orderData.id;

        // Insert order items
        const itemsToInsert = orderItems.map(oi => ({
            ...oi,
            order_id: orderId
        }));
        
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        // 3. Create Stripe Checkout Session
        const host = req.headers['x-forwarded-host'] || req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const domainURL = `${protocol}://${host}`;

        const lineItems = orderItems.map(oi => {
            let desc = `Size: ${oi.size_label_en}`;
            if (oi.toppings.length > 0) {
                desc += ` | Extras: ${oi.toppings.map(t => t.label_en).join(', ')}`;
            }
            if (oi.special_notes) {
                desc += ` | Notes: ${oi.special_notes}`;
            }

            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: oi.item_name_en,
                        description: desc
                    },
                    unit_amount: oi.unit_price,
                },
                quantity: oi.quantity,
            };
        });

        if (deliveryFee > 0) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: 'Delivery Fee',
                    },
                    unit_amount: deliveryFee,
                },
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: customer.email,
            line_items: lineItems,
            metadata: {
                orderId: orderId
            },
            success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainURL}/index.html?cart_cancelled=true`,
        });

        // 4. Update order with Stripe Session ID
        await supabase
            .from('orders')
            .update({ stripe_session_id: session.id })
            .eq('id', orderId);

        res.status(200).json({ sessionId: session.id, url: session.url });

    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: err.message });
    }
}
