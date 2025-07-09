const pool = require('../../config/db');

exports.fetchAccounts = async (userId) => {
  let sql = 'SELECT id, user_id, currency, created_at FROM accounts';
  const params = [];
  if (userId) {
    sql += ' WHERE user_id=$1';
    params.push(userId);
  }
  sql += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(sql, params);
  return rows;
};

exports.createAccount = async (userId, currency, balance) => {
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
    return { ...account, balance };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.updateCurrency = async (id, currency) => {
  const { rows, rowCount } = await pool.query(
    'UPDATE accounts SET currency=$1 WHERE id=$2 RETURNING *',
    [currency, id]
  );
  return rowCount ? rows[0] : null;
};

exports.deleteAccount = async (id) => {
  await pool.query('DELETE FROM transactions WHERE account_id=$1', [id]);
  await pool.query('DELETE FROM accounts WHERE id=$1', [id]);
};
