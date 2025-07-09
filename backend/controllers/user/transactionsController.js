const { listTransactions, createTransaction, updateTransaction, deleteTransaction } = require('../../services/transactionService');
const { validationResult } = require('express-validator');

exports.list = async (req, res, next) => {
  try {
    const userId = req.auth.sub;
    const accountId = req.query.account_id ? parseInt(req.query.account_id, 10) : null;
    const transactions = await listTransactions(userId, accountId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const userId = req.auth.sub;
    const { account_id, type, amount, description } = req.body;
    const transaction = await createTransaction(userId, account_id, type, amount, description);
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const userId = req.auth.sub;
    const id = parseInt(req.params.id, 10);
    const { amount, description } = req.body;
    const updated = await updateTransaction(userId, id, amount, description);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const userId = req.auth.sub;
    const id = parseInt(req.params.id, 10);
    await deleteTransaction(userId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};