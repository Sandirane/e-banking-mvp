const { body, param } = require('express-validator');

exports.create = [
  body('currency').optional().isString(),
  body('balance').optional().isFloat({ min: 0 }),
];

exports.update = [
  param('id').isInt({ gt:1 }),
  body('currency').isString().isLength({ min:3, max:10 }),
];

exports.idParam = [
  param('id').isInt({ gt:0 }),
];