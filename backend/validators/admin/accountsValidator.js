const { body, param, query } = require('express-validator');
const { validate } = require('../../middlewares/validation');

exports.getAccounts = [
  query('userId')
    .optional()
    .isUUID()
    .withMessage('userId doit être un UUID valide'),
  validate
];

exports.createAccount = [
  body('userId')
    .exists().withMessage('userId est requis')
    .isUUID().withMessage('userId doit être un UUID valide'),

  body('currency')
    .optional()
    .isString().withMessage('currency doit être une chaîne de caractères'),

  body('balance')
    .optional()
    .isFloat({ min: 0 }).withMessage('balance doit être un nombre positif'),

  validate
];

exports.updateAccount = [
  param('id')
    .isInt({ gt: 0 }).withMessage('id doit être un entier positif'),

  body('currency')
    .optional()
    .isString().withMessage('currency doit être une chaîne'),

  body('balance')
    .optional()
    .isFloat({ min: 0 }).withMessage('balance doit être un nombre positif'),

  validate
];

exports.deleteAccount = [
  param('id')
    .isInt({ gt: 0 }).withMessage('id doit être un entier positif'),

  validate
];
