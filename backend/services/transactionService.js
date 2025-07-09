
const pool = require('../config/db');

async function listTransactions(userId, accountId) {
  // if accountId provided, ensure ownership inside query
  if (accountId) {
    await pool.query('SELECT 1 FROM accounts WHERE id=$1 AND user_id=$2', [accountId, userId]);
    const res = await pool.query(
      `SELECT id, account_id, amount, type, description, created_at
       FROM transactions
       WHERE account_id=$1
       ORDER BY created_at DESC`,
      [accountId]
    );
    return res.rows;
  }
  // all accounts
  const accRes = await pool.query('SELECT id FROM accounts WHERE user_id=$1', [userId]);
  const ids = accRes.rows.map(r => r.id);
  if (!ids.length) return [];
  const res = await pool.query(
    `SELECT id, account_id, amount, type, description, created_at
     FROM transactions
     WHERE account_id = ANY($1)
     ORDER BY created_at DESC`,
    [ids]
  );
  return res.rows;
}

async function createTransaction(userId, accountId, type, amount, description=null) {
  // verify ownership
  const acc = await pool.query('SELECT id FROM accounts WHERE id=$1 AND user_id=$2', [accountId, userId]);
  if (!acc.rowCount) throw { status: 403, message: 'Account not found or unauthorized' };
  const res = await pool.query(
    `INSERT INTO transactions(account_id, amount, type, description)
     VALUES($1,$2,$3,$4)
     RETURNING id, account_id, amount, type, description, created_at`,
    [accountId, amount, type, description]
  );
  return res.rows[0];
}

async function updateTransaction(userId, id, amount, description) {
  // ensure ownership via join
  const txRes = await pool.query(
    `UPDATE transactions t
     SET amount = COALESCE($1, t.amount), description = COALESCE($2, t.description)
     FROM accounts a
     WHERE t.id=$3 AND a.id=t.account_id AND a.user_id=$4
     RETURNING t.*`,
    [amount, description, id, userId]
  );
  if (!txRes.rowCount) throw { status: 404, message: 'Transaction not found' };
  return txRes.rows[0];
}

async function deleteTransaction(userId, id) {
  const res = await pool.query(
    `DELETE FROM transactions t USING accounts a
     WHERE t.id=$1 AND a.id=t.account_id AND a.user_id=$2`,
    [id, userId]
  );
  if (!res.rowCount) throw { status: 404, message: 'Transaction not found' };
}

module.exports = { listTransactions, createTransaction, updateTransaction, deleteTransaction };
