require('dotenv').config();
const handler = require('./api/create-order.js').default;
const req = {
    method: 'POST',
    headers: { host: 'localhost:3000' },
    body: {
        customer: { name: 'Test', email: 'test@test.com', phone: '123', type: 'takeaway' },
        items: [
            { id: 'cheeseburger_1', size: 'norm', quantity: 1, toppings: [] }
        ]
    }
};
const res = {
    status: function(code) { console.log('STATUS:', code); return this; },
    json: function(data) { console.log('JSON:', data); return this; }
};
handler(req, res).catch(console.error);
