const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

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

// Generar código de ticket único (ej. INF-4F9A)
const generateTicket = () => {
    return 'INF-' + Math.random().toString(36).substring(2, 6).toUpperCase();
};

// POST add a repair ticket (Client or Admin)
router.post('/', async (req, res) => {
    const { client_name, client_dni, client_phone, device_problem } = req.body;
    const ticket_code = generateTicket();
    try {
        const [result] = await pool.query(
            'INSERT INTO repairs (ticket_code, client_name, client_dni, client_phone, device_problem) VALUES (?, ?, ?, ?, ?)',
            [ticket_code, client_name, client_dni, client_phone, device_problem]
        );
        res.status(201).json({ message: 'Reparación registrada', ticket_code });
    } catch (err) {
        res.status(500).json({ message: 'Error al registrar reparación', error: err.message });
    }
});

// GET track repair status (Public: by DNI or Ticket Code)
router.get('/track', async (req, res) => {
    const { query } = req.query; // query es DNI o Ticket
    try {
        const [rows] = await pool.query(
            'SELECT ticket_code, client_name, device_problem, progress_percentage, status, updated_at FROM repairs WHERE ticket_code = ? OR client_dni = ? ORDER BY created_at DESC',
            [query, query]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron reparaciones para ese código o DNI' });
        }
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al consultar reparación' });
    }
});

// ADMIN ROUTES

// GET all repairs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM repairs ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener reparaciones' });
    }
});

// PUT update repair status and progress
router.put('/:id', authenticateToken, async (req, res) => {
    const { status, progress_percentage } = req.body;
    try {
        await pool.query(
            'UPDATE repairs SET status=?, progress_percentage=? WHERE id=?',
            [status, progress_percentage, req.params.id]
        );
        res.json({ message: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar reparación' });
    }
});

module.exports = router;
