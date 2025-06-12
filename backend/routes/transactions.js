const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { query, body, validationResult } = require('express-validator');

// GET /api/transactions?account_id=...
router.get(
  '/',
  [
    query('account_id').optional().isInt({ gt: 0 }).withMessage('account_id doit être un entier positif'),
  ],
  async (req, res) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.auth && req.auth.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const accountId = req.query.account_id ? parseInt(req.query.account_id, 10) : null;

    try {
      if (accountId) {
        const accountRes = await pool.query(
          'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
          [accountId, userId]
        );
        if (accountRes.rows.length === 0) {
          return res.status(403).json({ error: 'Compte non autorisé ou introuvable.' });
        } 
        const txRes = await pool.query(
          `SELECT id, account_id, amount, type, description, created_at
           FROM transactions
           WHERE account_id = $1
           ORDER BY created_at DESC`,
          [accountId]
        );
        return res.json(txRes.rows);
      } else { 
        const accountsRes = await pool.query(
          'SELECT id FROM accounts WHERE user_id = $1',
          [userId]
        );
        const accountIds = accountsRes.rows.map(r => r.id);
        if (accountIds.length === 0) {
          return res.json([]); 
        }
        const txRes = await pool.query(
          `SELECT id, account_id, amount, type, description, created_at
           FROM transactions
           WHERE account_id = ANY($1)
           ORDER BY created_at DESC`,
          [accountIds]
        );
        return res.json(txRes.rows);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ error: 'Erreur interne lors de la récupération des transactions.' });
    }
  }
);

// POST /api/transactions
router.post(
  '/',
  [
    body('account_id').isInt({ gt: 0 }).withMessage('account_id doit être un entier positif'),
    body('type').isIn(['deposit', 'withdraw']).withMessage("type doit être 'deposit' ou 'withdraw'"),
    body('amount').isFloat({ gt: 0 }).withMessage('amount doit être un nombre > 0'),
    body('description').optional().isString().withMessage('description doit être une chaîne'),
  ],
  async (req, res) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.auth && req.auth.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const accountId = parseInt(req.body.account_id, 10);
    const type = req.body.type;
    const amount = parseFloat(req.body.amount);
    const description = req.body.description || null;

    const client = await pool.connect();
    try { 
      const accountRes = await client.query(
        'SELECT id, balance FROM accounts WHERE id = $1 AND user_id = $2 FOR UPDATE',
        [accountId, userId]
      );
      if (accountRes.rows.length === 0) {
        return res.status(403).json({ error: 'Compte non autorisé ou introuvable.' });
      }
      const currentBalance = parseFloat(accountRes.rows[0].balance);
 
      let newBalance;
      if (type === 'deposit') {
        newBalance = currentBalance + amount;
      } else { 
        if (currentBalance < amount) {
          return res.status(400).json({ error: 'Solde insuffisant pour le retrait.' });
        }
        newBalance = currentBalance - amount;
      }
 
      await client.query('BEGIN'); 
      await client.query(
        'UPDATE accounts SET balance = $1 WHERE id = $2',
        [newBalance, accountId]
      ); 
      const insertRes = await client.query(
        `INSERT INTO transactions (account_id, amount, type, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id, account_id, amount, type, description, created_at`,
        [accountId, amount, type, description]
      );
      await client.query('COMMIT');

      const tx = insertRes.rows[0];
      return res.status(201).json({
        transaction: tx,
        newBalance: newBalance
      });
    } catch (err) { 
      try {
        await client.query('ROLLBACK');
      } catch (rbErr) {
        console.error('Rollback error:', rbErr);
      }
      console.error('Error creating transaction:', err);
      return res.status(500).json({ error: 'Erreur interne lors de la création de la transaction.' });
    } finally {
      client.release();
    }
  }
);

module.exports = router;