const { body, param, query } = require('express-validator');
const { validate } = require('../../middlewares/validation');

exports.getTransactions = [
  query('userId').optional().isUUID(),
  query('accountId').optional().isInt({ gt: 0 }),
  validate
];

exports.createTransaction = [
  body('account_id').isInt({ gt: 0 }),
  body('type').isIn(['deposit', 'withdraw']),
  body('amount').isFloat({ gt: 0 }),
  body('description').optional().isString(),
  validate
];

exports.updateTransaction = [
  param('id').isInt({ gt: 0 }),
  body('amount').optional().isFloat({ gt: 0 }),
  body('description').optional().isString(),
  validate
];

exports.deleteTransaction = [
  param('id').isInt({ gt: 0 }),
  validate
];
