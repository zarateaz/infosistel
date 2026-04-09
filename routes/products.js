const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Multer config for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

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

// GET all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});

// GET categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

// POST new product
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, stock, category_id, image_url]
        );
        res.status(201).json({ message: 'Producto creado exitosamente', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Error al crear producto', error: err.message });
    }
});

// PUT update product
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock, category_id } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    let query = 'UPDATE products SET name=?, description=?, price=?, stock=?, category_id=?';
    let params = [name, description, price, stock, category_id];

    if (image_url) {
        query += ', image_url=?';
        params.push(image_url);
    }
    
    query += ' WHERE id=?';
    params.push(id);

    try {
        await pool.query(query, params);
        res.json({ message: 'Producto actualizado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar producto', error: err.message });
    }
});

// DELETE product
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

module.exports = router;
