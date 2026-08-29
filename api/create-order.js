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
            
            const standardPrice = item.size === 'family' ? 200 : 100;
            const premiumPrice = item.size === 'family' ? 350 : 200;
            
            const standardToppingsSet = new Set(['pineapple', 'blue_cheese', 'egg', 'bbq_sauce', 'feta', 'mushroom', 'jalapeno', 'cheese', 'mozzarella', 'olive', 'paprika', 'red_onion', 'onion', 'pickle', 'tomato', 'double_cheese', 'turkish_pepper', 'garlic', 'cherry_tomato']);
            const premiumToppingsSet = new Set(['minced_meat', 'chicken', 'shrimp', 'kebab', 'ham', 'pepperoni', 'salami', 'mussel', 'tuna', 'bacon']);
            
            if (item.toppings && Array.isArray(item.toppings)) {
                for (const t of item.toppings) {
                    // `t` in payload is { id, label_en, label_fi } or { value, en, fi } depending on frontend mapping.
                    // Wait, frontend cart saves them as { value, en, fi }? Let me check how Cart.addItem is constructed in cart.js.
                    // Previously it was id. Let's handle both or check frontend.
                    // Wait! In checkout, it sends `t.id`.
                    // The t.id or t.value. In frontend Modal.updateDisplay we just set input value. But in `Modal.addToCart`?
                    
                    let tId = t.id || t.value;
                    let tPrice = 0;
                    
                    if (standardToppingsSet.has(tId)) {
                        tPrice = standardPrice;
                    } else if (premiumToppingsSet.has(tId)) {
                        tPrice = premiumPrice;
                    } else {
                        // Fallback
                        tPrice = standardPrice;
                    }
                    
                    toppingTotal += tPrice;
                    validToppings.push({
                        id: tId,
                        label_en: t.label_en || t.en || tId,
                        label_fi: t.label_fi || t.fi || tId,
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
        // Use configured APP_URL to prevent host header poisoning attacks
        const domainURL = process.env.APP_URL || (() => {
            const host = req.headers['x-forwarded-host'] || req.headers.host;
            const protocol = host && host.includes('localhost') ? 'http' : 'https';
            return `${protocol}://${host}`;
        })();

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
