// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const {
  query,
  param,
  body,
  validationResult
} = require('express-validator');

const axios = require('axios');
const qs = require('qs');
const realm = process.env.KEYCLOAK_REALM;

// GET /api/admin/accounts
router.get(
  '/accounts',
  [query('userId').optional().isUUID()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
      errors: errors.array()
    });
    const {
      userId
    } = req.query;
    let sql = 'SELECT id, user_id, currency, created_at FROM accounts';
    const params = [];
    if (userId) {
      params.push(userId);
      sql += ' WHERE user_id=$1';
    }
    sql += ' ORDER BY created_at DESC';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  }
);

//POST /api/admin/accounts
router.post(
  '/accounts',
  [
    body('userId').isUUID().withMessage('userId doit être un UUID'),
    body('currency').optional().isString(),
    body('balance').optional().isFloat({
      min: 0
    }).withMessage('balance >= 0'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    const {
      userId,
      currency = 'EUR',
      balance = 0
    } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const {
        rows
      } = await client.query(
        'INSERT INTO accounts (user_id, currency) VALUES ($1, $2) RETURNING *',
        [userId, currency]
      );
      const account = rows[0];

      if (balance > 0) {
        await client.query(
          `INSERT INTO transactions
             (account_id, amount, type, description)
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
        balance
      });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error creating admin account:', err);
      res.status(500).json({
        error: err.message
      });
    } finally {
      client.release();
    }
  }
);

// PUT /api/admin/accounts/:id 
router.put(
  '/accounts/:id',
  [
    param('id').isInt({
      gt: 0
    }),
    body('currency').isString().isLength({
      min: 3,
      max: 10
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length) return res.status(400).json({
      errors: errors.array()
    });

    const id = parseInt(req.params.id, 10);
    const {
      currency
    } = req.body;
    try {
      const {
        rows,
        rowCount
      } = await pool.query(
        'UPDATE accounts SET currency = $1 WHERE id = $2 RETURNING *',
        [currency, id]
      );
      if (!rowCount) return res.status(404).json({
        error: 'Compte introuvable'
      });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'Erreur interne lors de la mise à jour du compte.'
      });
    }
  }
);

// DELETE /api/admin/accounts/:id
router.delete(
  '/accounts/:id',
  [param('id').isInt({
    gt: 0
  })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
      errors: errors.array()
    });
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
    query('accountId').optional().isInt({
      gt: 0
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
      errors: errors.array()
    });
    const {
      userId,
      accountId
    } = req.query;
    let sql = 'SELECT t.* FROM transactions t JOIN accounts a ON a.id=t.account_id';
    const clauses = [];
    const params = [];
    if (userId) {
      clauses.push(`a.user_id=$${params.push(userId)}`);
    }
    if (accountId) {
      clauses.push(`t.account_id=$${params.push(parseInt(accountId, 10))}`);
    }
    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
    sql += ' ORDER BY t.created_at DESC';
    const r = await pool.query(sql, params);
    res.json(r.rows);
  }
);

// POST /api/admin/transactions
router.post(
  '/transactions',
  [
    body('account_id').isInt({
      gt: 0
    }).withMessage('account_id doit être un entier positif'),
    body('type').isIn(['deposit', 'withdraw']).withMessage("type doit être 'deposit' ou 'withdraw'"),
    body('amount').isFloat({
      gt: 0
    }).withMessage('amount doit être un nombre > 0'),
    body('description').optional().isString().withMessage('description doit être une chaîne'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({
      errors: errors.array()
    });

    const {
      account_id,
      type,
      amount,
      description = null
    } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const {
        rowCount
      } = await client.query(
        'SELECT 1 FROM accounts WHERE id = $1',
        [account_id]
      );
      if (!rowCount) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          error: 'Compte introuvable.'
        });
      }

      const {
        rows
      } = await client.query(
        `INSERT INTO transactions (account_id, amount, type, description)
         VALUES ($1, $2, $3, $4)
         RETURNING id, account_id, amount, type, description, created_at`,
        [account_id, amount, type, description]
      );
      await client.query('COMMIT');
      res.status(201).json(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error creating admin transaction:', err);
      res.status(500).json({
        error: err.message
      });
    } finally {
      client.release();
    }
  }
);

// PUT /api/admin/transactions/:id
router.put(
  '/transactions/:id',
  [
    param('id').isInt({
      gt: 0
    }),
    body('amount').optional().isFloat({
      gt: 0
    }),
    body('description').optional().isString()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.array().length) return res.status(400).json({
      errors: errors.array()
    });

    const id = parseInt(req.params.id, 10);
    const {
      amount,
      description
    } = req.body;
    try {
      const {
        rows,
        rowCount
      } = await pool.query(
        `UPDATE transactions 
         SET amount = COALESCE($1, amount),
             description = COALESCE($2, description)
         WHERE id = $3
         RETURNING *`,
        [amount, description, id]
      );
      if (!rowCount) return res.status(404).json({
        error: 'Transaction introuvable'
      });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: 'Erreur interne lors de la mise à jour de la transaction.'
      });
    }
  }
);

// DELETE /api/admin/transactions/:id
router.delete(
  '/transactions/:id',
  [param('id').isInt({
    gt: 0
  }).withMessage('id doit être un entier positif')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    const id = parseInt(req.params.id, 10);
    try {
      const {
        rowCount
      } = await pool.query(
        'DELETE FROM transactions WHERE id = $1',
        [id]
      );
      if (!rowCount) {
        return res.status(404).json({
          error: 'Transaction introuvable.'
        });
      }
      return res.status(204).end();
    } catch (err) {
      console.error('Error deleting admin transaction:', err);
      return res.status(500).json({
        error: 'Erreur interne lors de la suppression.'
      });
    }
  }
);

router.get('/users', async (req, res) => {
  try {
    // 1) Récupérer un token admin dans LE MÊME realm
    const tokenResp = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_ADMIN_REALM}/protocol/openid-connect/token`,
      qs.stringify({
        grant_type: 'password',
        client_id: process.env.KEYCLOAK_ADMIN_CLIENT,
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const adminToken = tokenResp.data.access_token;

    // 2) Lister les utilisateurs dans ce même realm
    const usersResp = await axios.get(
      `${process.env.KEYCLOAK_URL}/admin/realms/${realm}/users`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    // 3) Ne garder que ce qui t’intéresse
    const users = usersResp.data.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
    }));

    res.json(users);
  } catch (err) {
    // logs plus détaillés
    console.error('Error fetching Keycloak users:', err.response?.data || err);
    res.status(500).json({ error: 'Impossible de récupérer les utilisateurs.' });
  }
});

module.exports = router;