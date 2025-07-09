const pool = require('../config/db');

async function checkOwnership(req, res, next) {
  const accId = parseInt(req.params.id, 10);
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
    console.error('Ownership check error:', err);
    res.status(500).json({ error: 'Erreur interne' });
  }
}

module.exports = { checkOwnership };