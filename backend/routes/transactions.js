const express = require('express');
const pool = require('../config/db');
const router  = express.Router();
const { query, body, param, validationResult } = require('express-validator');

// Check account user
async function checkTxOwnership(req, res, next) {
  const txId   = parseInt(req.params.id, 10);
  const userId = req.auth.sub;
  try {
    const { rowCount } = await pool.query(
      `SELECT 1
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       WHERE t.id = $1 AND a.user_id = $2`,
      [txId, userId]
    );
    if (!rowCount) return res.status(403).json({ error: 'Non autorisé' });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/transactions?account_id=...
router.get(
  '/',
  [ query('account_id').optional().isInt({ gt: 0 }) ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.auth) return res.status(401).json({ error: 'Token manquant ou invalide' });
    const userId = req.auth.sub;
    const accountId = req.query.account_id ? parseInt(req.query.account_id, 10) : null;

    try {
      if (accountId) { 
        const { rowCount } = await pool.query(
          'SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2',
          [accountId, userId]
        );
        if (!rowCount) {
          return res.status(403).json({ error: 'Compte non autorisé ou introuvable.' });
        }
        const txs = await pool.query(
          `SELECT id, account_id, amount, type, description, created_at
           FROM transactions
           WHERE account_id = $1
           ORDER BY created_at DESC`,
          [accountId]
        );
        return res.json(txs.rows);
      }
 
      const accountsRes = await pool.query(
        'SELECT id FROM accounts WHERE user_id = $1',
        [userId]
      );
      const ids = accountsRes.rows.map(r => r.id);
      if (ids.length === 0) return res.json([]);

      const txs = await pool.query(
        `SELECT id, account_id, amount, type, description, created_at
         FROM transactions
         WHERE account_id = ANY($1)
         ORDER BY created_at DESC`,
        [ids]
      );
      res.json(txs.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne lors de la récupération.' });
    }
  }
);

// POST /api/transactions
router.post(
  '/',
  [
    body('account_id').isInt({ gt: 0 }),
    body('type').isIn(['deposit','withdraw']),
    body('amount').isFloat({ gt: 0 }),
    body('description').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!req.auth) return res.status(401).json({ error: 'Token manquant ou invalide' });

    const userId    = req.auth.sub;
    const accountId = parseInt(req.body.account_id, 10);
    const { type, amount, description = null } = req.body;

    try { 
      const { rowCount } = await pool.query(
        'SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2',
        [accountId,userId]
      );
      if (!rowCount) {
        return res.status(403).json({ error: 'Compte non autorisé ou introuvable.' });
      }
 
      const { rows } = await pool.query(
        `INSERT INTO transactions (account_id, amount, type, description)
         VALUES ($1,$2,$3,$4)
         RETURNING id, account_id, amount, type, description, created_at`,
        [accountId, amount, type, description]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur interne lors de la création.' });
    }
  }
);

// PUT /api/transactions/:id
router.put(
  '/:id',
  checkTxOwnership,
  [
    param('id').isInt(),
    body('amount').optional().isFloat({ gt: 0 }),
    body('description').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const txId        = parseInt(req.params.id, 10);
    const { amount, description } = req.body;
    try {
      const { rows } = await pool.query(
        'UPDATE transactions SET amount = COALESCE($1, amount), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
        [amount, description, txId]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE /api/transactions/:id
router.delete('/:id', checkTxOwnership, async (req, res) => {
  const txId = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [txId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
