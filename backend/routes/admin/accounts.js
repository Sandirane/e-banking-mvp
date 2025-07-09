const express = require('express');
const router = express.Router();
const accountsController = require('../../controllers/admin/accountsController');
const accountValidators = require('../../validators/admin/accountsValidator');

router.get('/', accountValidators.getAccounts, accountsController.getAccounts);
router.post('/', accountValidators.createAccount, accountsController.createAccount);
router.put('/:id', accountValidators.updateAccount, accountsController.updateAccount);
router.delete('/:id', accountValidators.deleteAccount, accountsController.deleteAccount);

module.exports = router;
