// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { query, param, validationResult } = require('express-validator');

/**
 * GET /api/admin/accounts 
 */
router.get(
  '/accounts',
  [ 
    query('userId')
      .optional()
      .isUUID()
      .withMessage('userId doit être un UUID valide'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { userId } = req.query;
      let result;
      if (userId) {
        result = await pool.query(
          'SELECT id, user_id, balance, currency, created_at FROM accounts WHERE user_id = $1',
          [userId]
        );
      } else {
        result = await pool.query(
          'SELECT id, user_id, balance, currency, created_at FROM accounts'
        );
      }
      return res.json(result.rows);
    } catch (err) {
      console.error('Error in GET /api/admin/accounts:', err);
      return res.status(500).json({ error: 'Erreur interne lors de la récupération des comptes.' });
    }
  }
); 
/**
 * DELETE /api/admin/accounts/:id 
 */
router.delete(
  '/accounts/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('id doit être un entier positif'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const accountId = parseInt(req.params.id, 10);
    try { 
      const check = await pool.query('SELECT id FROM accounts WHERE id = $1', [accountId]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: 'Compte introuvable.' });
      } 
      await pool.query('DELETE FROM accounts WHERE id = $1', [accountId]);
      return res.status(200).json({ message: `Compte ${accountId} supprimé.` });
    } catch (err) {
      console.error('Error in DELETE /api/admin/accounts/:id:', err);
      return res.status(500).json({ error: 'Erreur interne lors de la suppression du compte.' });
    }
  }
); 
/**
 * GET /api/admin/transactions 
 */
router.get(
  '/transactions',
  [
    query('userId').optional().isUUID().withMessage('userId doit être un UUID valide'),
    query('accountId').optional().isInt({ gt: 0 }).withMessage('accountId doit être un entier positif'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userId, accountId } = req.query;
    try {
      if (userId && accountId) { 
        const check = await pool.query(
          'SELECT id FROM accounts WHERE id = $1 AND user_id = $2',
          [parseInt(accountId, 10), userId]
        );
        if (check.rows.length === 0) {
          return res.status(403).json({ error: 'Compte non autorisé ou introuvable' });
        } 
        const txRes = await pool.query(
          `SELECT id, account_id, amount, type, description, created_at
           FROM transactions
           WHERE account_id = $1
           ORDER BY created_at DESC`,
          [parseInt(accountId, 10)]
        );
        return res.json(txRes.rows);
      }
      if (userId) { 
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
      if (accountId) { 
        const txRes = await pool.query(
          `SELECT id, account_id, amount, type, description, created_at
           FROM transactions
           WHERE account_id = $1
           ORDER BY created_at DESC`,
          [parseInt(accountId, 10)]
        );
        return res.json(txRes.rows);
      } 
      const allTxRes = await pool.query(
        `SELECT id, account_id, amount, type, description, created_at
         FROM transactions
         ORDER BY created_at DESC`
      );
      return res.json(allTxRes.rows);
    } catch (err) {
      console.error('Error in GET /api/admin/transactions:', err);
      return res.status(500).json({ error: 'Erreur interne lors de la récupération des transactions.' });
    }
  }
);

module.exports = router;
