const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/user/transactionsController');
const { create: validateCreate, update: validateUpdate, idParam } = require('../../validators/transactionValidators');
const { checkTxOwnership } = require('../../middlewares/checkTxOwnership');

router.get('/', ctrl.list);
router.post('/', validateCreate, ctrl.create);
router.put('/:id', idParam, validateUpdate, ctrl.update);
router.delete('/:id', idParam, checkTxOwnership, ctrl.remove);

module.exports = router;