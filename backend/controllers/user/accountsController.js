const { getAccounts, createAccount, getAccountById, updateAccountCurrency, deleteAccount } = require('../../services/accountService');
const { validationResult } = require('express-validator');

exports.list = async (req, res, next) => {
  try {
    const userId = req.auth.sub;
    const accounts = await getAccounts(userId);
    res.json(accounts);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const userId = req.auth.sub;
    const { balance, currency } = req.body;
    const account = await createAccount(userId, currency, balance);
    res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const userId = req.auth.sub;
    const account = await getAccountById(userId, id);
    res.json(account);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const id = parseInt(req.params.id, 10);
    const { currency } = req.body;
    const updated = await updateAccountCurrency(req.auth.sub, id, currency);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await deleteAccount(req.auth.sub, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
