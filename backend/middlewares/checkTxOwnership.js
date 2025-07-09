const pool = require('../config/db');

async function checkTxOwnership(req, res, next) {
    const txId = parseInt(req.params.id, 10);
    const userId = req.auth.sub;
    try {
        const { rowCount } = await pool.query(
            `SELECT 1
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       WHERE t.id = $1 AND a.user_id = $2`,
            [txId, userId]
        );
        if (!rowCount) {
            return res.status(403).json({ error: 'Non autorisé' });
        }
        next();
    } catch (err) {
        console.error('Ownership check error:', err);
        res.status(500).json({ error: 'Erreur interne' });
    }
}

module.exports = { checkTxOwnership };