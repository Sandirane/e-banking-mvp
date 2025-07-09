const pool = require('../../config/db');

exports.fetchTransactions = async (userId, accountId) => {
  let sql = `SELECT t.* FROM transactions t JOIN accounts a ON a.id = t.account_id`;
  const clauses = [];
  const params = [];

  if (userId) {
    clauses.push(`a.user_id = $${params.length + 1}`);
    params.push(userId);
  }

  if (accountId) {
    clauses.push(`t.account_id = $${params.length + 1}`);
    params.push(accountId);
  }

  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  sql += ' ORDER BY t.created_at DESC';

  const { rows } = await pool.query(sql, params);
  return rows;
};

exports.createTransaction = async (account_id, type, amount, description) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rowCount } = await client.query('SELECT 1 FROM accounts WHERE id=$1', [account_id]);
    if (!rowCount) throw new Error('Compte introuvable');

    const { rows } = await client.query(
      `INSERT INTO transactions (account_id, amount, type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, account_id, amount, type, description, created_at`,
      [account_id, amount, type, description]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.updateTransaction = async (id, amount, description) => {
  const { rows, rowCount } = await pool.query(
    `UPDATE transactions
     SET amount = COALESCE($1, amount),
         description = COALESCE($2, description)
     WHERE id = $3
     RETURNING *`,
    [amount, description, id]
  );
  return rowCount ? rows[0] : null;
};

exports.deleteTransaction = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM transactions WHERE id=$1', [id]);
  return rowCount > 0;
};
