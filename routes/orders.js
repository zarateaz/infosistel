const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

// Middleware for Admin auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// POST /api/orders - Create a new order (Public)
router.post('/', async (req, res) => {
    const { 
        customer_name, 
        customer_phone, 
        customer_dni, 
        customer_address, 
        items, 
        total_price 
    } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Insert order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (customer_name, customer_phone, customer_dni, customer_address, total_price) VALUES (?, ?, ?, ?, ?)',
            [customer_name, customer_phone, customer_dni, customer_address, total_price]
        );
        const orderId = orderResult.insertId;

        // 2. Insert order items
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            
            // 3. Update stock (optional but recommended)
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Pedido realizado con éxito', orderId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Error al procesar el pedido', error: err.message });
    } finally {
        connection.release();
    }
});

// GET /api/orders - Get all orders (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        
        // Fetch items for each order
        const ordersWithItems = await Promise.all(rows.map(async (order) => {
            const [items] = await pool.query(`
                SELECT oi.*, p.name as product_name 
                FROM order_items oi 
                JOIN products p ON oi.product_id = p.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            return { ...order, items };
        }));

        res.json(ordersWithItems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
});

// PATCH /api/orders/:id - Update order status (Admin only)
router.patch('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // Pendiente, Completado, Cancelado

    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Estado del pedido actualizado' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating order', error: err.message });
    }
});

module.exports = router;
