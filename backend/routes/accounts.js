const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/accounts
router.get('/', async (req, res) => {
  console.log('Route GET /api/accounts, req.auth =', req.auth);
  if (!req.auth) {
    return res.status(401).json({ error: 'Missing token payload' });
  }
  const keycloakId = req.auth.sub;
  try {
    const result = await pool.query('SELECT * FROM accounts WHERE user_id = $1', [keycloakId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching accounts:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  console.log('Route POST /api/accounts, req.auth =', req.auth);
  if (!req.auth) {
    return res.status(401).json({ error: 'Missing token payload' });
  }
  const keycloakId = req.auth.sub;
  const { balance, currency } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO accounts (user_id, balance, currency) VALUES ($1, $2, $3) RETURNING *',
      [keycloakId, balance ?? 0.00, currency ?? 'EUR']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating account:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
