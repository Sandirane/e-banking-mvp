const pool = require('../config/db');

async function getAccounts(userId) {
  const result = await pool.query(`
    SELECT a.id, a.user_id, a.currency, a.created_at,
      COALESCE(SUM(CASE t.type WHEN 'deposit' THEN t.amount WHEN 'withdraw' THEN -t.amount END),0) AS balance
    FROM accounts a
    LEFT JOIN transactions t ON a.id=t.account_id
    WHERE a.user_id=$1
    GROUP BY a.id
    ORDER BY a.created_at DESC`, [userId]);
  return result.rows.map(r => ({ ...r, balance: parseFloat(r.balance) }));
}

async function createAccount(userId, currency='EUR', balance=0) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ins = await client.query(
      'INSERT INTO accounts(user_id,currency) VALUES($1,$2) RETURNING *',
      [userId, currency]
    );
    const account = ins.rows[0];
    if (balance > 0) {
      await client.query(
        'INSERT INTO transactions(account_id,amount,type,description) VALUES($1,$2,\'deposit\',\'Ouverture\')',
        [account.id, balance]
      );
    }
    await client.query('COMMIT');
    return { ...account, balance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getAccountById(userId, id) {
  const result = await pool.query(`
    SELECT a.id,a.user_id,a.currency,a.created_at,
      COALESCE(SUM(CASE t.type WHEN 'deposit' THEN t.amount WHEN 'withdraw' THEN -t.amount END),0) AS balance
    FROM accounts a
    LEFT JOIN transactions t ON a.id=t.account_id
    WHERE a.user_id=$1 AND a.id=$2
    GROUP BY a.id`, [userId, id]);
  if (!result.rowCount) throw { status: 404, message: 'Not found' };
  const r = result.rows[0];
  return { ...r, balance: parseFloat(r.balance) };
}

async function updateAccountCurrency(userId, id, currency) {
  const result = await pool.query(
    'UPDATE accounts SET currency=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
    [currency, id, userId]
  );
  if (!result.rowCount) throw { status: 404, message: 'Not found' };
  return result.rows[0];
}

async function deleteAccount(userId, id) {
  const tx = await pool.query(
    'SELECT 1 FROM transactions WHERE account_id=$1 LIMIT 1', [id]
  );
  if (tx.rowCount) throw { status: 400, message: 'Account not empty' };
  const del = await pool.query(
    'DELETE FROM accounts WHERE id=$1 AND user_id=$2', [id, userId]
  );
  if (!del.rowCount) throw { status: 404, message: 'Not found' };
}

module.exports = { getAccounts, createAccount, getAccountById, updateAccountCurrency, deleteAccount };
