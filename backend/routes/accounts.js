const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/accounts
router.get('/', async (req, res) => {
  console.log('Route GET /api/accounts, req.auth =', req.auth);
  if (!req.auth) return res.status(401).json({ error: 'Missing token payload' });
  const keycloakId = req.auth.sub;
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
        ), 0) AS calculated_balance
      FROM accounts a
      LEFT JOIN transactions t
        ON a.id = t.account_id
      WHERE a.user_id = $1
      GROUP BY a.id, a.user_id, a.currency, a.created_at
      ORDER BY a.created_at DESC
    `, [keycloakId]);

    const rows = result.rows.map(r => ({
      id:            r.id,
      user_id:       r.user_id,
      currency:      r.currency,
      created_at:    r.created_at,
      balance:       parseFloat(r.calculated_balance)
    }));
    res.json(rows);
  } catch (err) {
    console.error('Error fetching accounts with dynamic balance:', err);
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
  const { balance = 0.00, currency = 'EUR' } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN'); 
    const insertAcc = await client.query(
      'INSERT INTO accounts (user_id, currency) VALUES ($1, $2) RETURNING *',
      [keycloakId, currency]
    );
    const account = insertAcc.rows[0];
 
    if (balance > 0) {
      await client.query(
        `INSERT INTO transactions (account_id, amount, type, description)
         VALUES ($1, $2, 'deposit', 'Ouverture de compte')`,
        [account.id, balance]
      );
    }

    await client.query('COMMIT'); 
    res.status(201).json({
      id: account.id,
      user_id: account.user_id,
      currency: account.currency,
      created_at: account.created_at,
      balance: balance
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating account:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;