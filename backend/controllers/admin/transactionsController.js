const transactionService = require('../../services/admin/transactionService');

exports.getTransactions = async (req, res) => {
  const { userId, accountId } = req.query;
  const transactions = await transactionService.fetchTransactions(userId, accountId);
  res.json(transactions);
};

exports.createTransaction = async (req, res) => {
  const { account_id, type, amount, description = null } = req.body;
  try {
    const result = await transactionService.createTransaction(account_id, type, amount, description);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { amount, description } = req.body;
  try {
    const updated = await transactionService.updateTransaction(id, amount, description);
    if (!updated) return res.status(404).json({ error: 'Transaction introuvable' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne.' });
  }
};

exports.deleteTransaction = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const deleted = await transactionService.deleteTransaction(id);
    if (!deleted) return res.status(404).json({ error: 'Transaction introuvable' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne.' });
  }
};
