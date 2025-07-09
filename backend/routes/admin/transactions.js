const express = require('express');
const router = express.Router();
const transactionsController = require('../../controllers/admin/transactionsController');
const transactionValidators = require('../../validators/admin/transactionValidators');

router.get('/', transactionValidators.getTransactions, transactionsController.getTransactions);
router.post('/', transactionValidators.createTransaction, transactionsController.createTransaction);
router.put('/:id', transactionValidators.updateTransaction, transactionsController.updateTransaction);
router.delete('/:id', transactionValidators.deleteTransaction, transactionsController.deleteTransaction);

module.exports = router;
