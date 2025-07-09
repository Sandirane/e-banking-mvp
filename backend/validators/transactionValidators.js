const { body, param, query } = require('express-validator');

exports.list = [ query('account_id').optional().isInt({ gt:0 }) ];
exports.create = [
  body('account_id').isInt({ gt:0 }),
  body('type').isIn(['deposit','withdraw']),
  body('amount').isFloat({ gt:0 }),
  body('description').optional().isString()
];
exports.update = [
  param('id').isInt({ gt:0 }),
  body('amount').optional().isFloat({ gt:0 }),
  body('description').optional().isString()
];
exports.idParam = [ param('id').isInt({ gt:0 }) ];