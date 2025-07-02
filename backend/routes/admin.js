// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { query, param, validationResult } = require('express-validator');

// GET /api/admin/accounts
router.get(
  '/accounts',
  [query('userId').optional().isUUID()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { userId } = req.query;
    let sql = 'SELECT id, user_id, currency, created_at FROM accounts';
    const params = [];
    if (userId) { params.push(userId); sql += ' WHERE user_id=$1'; }
    sql += ' ORDER BY created_at DESC';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  }
);

// DELETE /api/admin/accounts/:id
router.delete(
  '/accounts/:id',
  [param('id').isInt({ gt: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const id = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM transactions WHERE account_id=$1', [id]);
    await pool.query('DELETE FROM accounts WHERE id=$1', [id]);
    res.status(204).end();
  }
);

// GET /api/admin/transactions
router.get(
  '/transactions',
  [
    query('userId').optional().isUUID(),
    query('accountId').optional().isInt({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { userId, accountId } = req.query;
    let sql = 'SELECT t.* FROM transactions t JOIN accounts a ON a.id=t.account_id';
    const clauses = [];
    const params = [];
    if (userId) { clauses.push(`a.user_id=$${params.push(userId)}`); }
    if (accountId) { clauses.push(`t.account_id=$${params.push(parseInt(accountId,10))}`); }
    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
    sql += ' ORDER BY t.created_at DESC';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  }
);

module.exports = router; 
