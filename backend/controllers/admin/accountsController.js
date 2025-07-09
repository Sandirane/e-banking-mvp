const accountService = require('../../services/admin/accountService');

exports.getAccounts = async (req, res) => {
  const { userId } = req.query;
  const accounts = await accountService.fetchAccounts(userId);
  res.json(accounts);
};

exports.createAccount = async (req, res) => {
  const { userId, currency = 'EUR', balance = 0 } = req.body;
  try {
    const account = await accountService.createAccount(userId, currency, balance);
    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  const id = parseInt(req.params.id);
  const { currency } = req.body;
  try {
    const updated = await accountService.updateCurrency(id, currency);
    if (!updated) return res.status(404).json({ error: 'Compte introuvable' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};

exports.deleteAccount = async (req, res) => {
  const id = parseInt(req.params.id);
  await accountService.deleteAccount(id);
  res.status(204).end();
};
