const express = require('express');
const pool = require('../config/db');
const router  = express.Router();

// Check account user  
async function checkOwnership(req, res, next) {
  const accId  = parseInt(req.params.id, 10);
  const userId = req.auth.sub;
  try {
    const { rowCount, rows } = await pool.query(
      'SELECT user_id FROM accounts WHERE id = $1',
      [accId]
    );
    if (!rowCount || rows[0].user_id !== userId) {
      return res.status(403).json({ error: 'Compte non autorisé' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/accounts
router.get('/', async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: 'Missing token payload' });
  const userId = req.auth.sub;
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a.user_id,
        a.currency,
        a.created_at,
        COALESCE(SUM(
          CASE t.type
            WHEN 'deposit'  THEN t.amount
            WHEN 'withdraw' THEN -t.amount
            ELSE 0
          END
        ), 0) AS balance
      FROM accounts a
      LEFT JOIN transactions t
        ON a.id = t.account_id
      WHERE a.user_id = $1
      GROUP BY a.id, a.user_id, a.currency, a.created_at
      ORDER BY a.created_at DESC
    `, [userId]);

    res.json(result.rows.map(r => ({
      id:         r.id,
      user_id:    r.user_id,
      currency:   r.currency,
      created_at: r.created_at,
      balance:    parseFloat(r.balance)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accounts
router.post('/', async (req, res) => {
  if (!req.auth) return res.status(401).json({ error: 'Missing token payload' });
  const userId          = req.auth.sub;
  const { balance = 0, currency = 'EUR' } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); 
    const { rows } = await client.query(
      'INSERT INTO accounts (user_id, currency) VALUES ($1, $2) RETURNING *',
      [userId, currency]
    );
    const account = rows[0]; 
    if (balance > 0) {
      await client.query(
        `INSERT INTO transactions (account_id, amount, type, description)
         VALUES ($1, $2, 'deposit', 'Ouverture de compte')`,
        [account.id, balance]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      id:         account.id,
      user_id:    account.user_id,
      currency:   account.currency,
      created_at: account.created_at,
      balance
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/accounts/:id
router.get('/:id', checkOwnership, async (req, res) => {
  const accId = parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query(`
      SELECT
        a.id,
        a.user_id,
        a.currency,
        a.created_at,
        COALESCE(SUM(
          CASE t.type
            WHEN 'deposit'  THEN t.amount
            WHEN 'withdraw' THEN -t.amount
            ELSE 0
          END
        ), 0) AS balance
      FROM accounts a
      LEFT JOIN transactions t
        ON a.id = t.account_id
      WHERE a.id = $1
      GROUP BY a.id, a.user_id, a.currency, a.created_at
    `, [accId]);

    const row = rows[0];
    res.json({
      id:         row.id,
      user_id:    row.user_id,
      currency:   row.currency,
      created_at: row.created_at,
      balance:    parseFloat(row.balance)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/accounts/:id
router.put('/:id', checkOwnership, async (req, res) => {
  const accId    = parseInt(req.params.id, 10);
  const { currency } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE accounts SET currency = $1 WHERE id = $2 RETURNING *',
      [currency, accId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', checkOwnership, async (req, res) => {
  const accId = parseInt(req.params.id, 10);
  try {
    // vérification absence de transactions
    const { rowCount } = await pool.query(
      'SELECT 1 FROM transactions WHERE account_id = $1 LIMIT 1',
      [accId]
    );
    if (rowCount) {
      return res.status(400).json({ error: 'Impossible : le compte contient des transactions' });
    }
    await pool.query('DELETE FROM accounts WHERE id = $1', [accId]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
