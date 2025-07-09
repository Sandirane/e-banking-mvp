const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/user/accountsController');
const { create, update, idParam } = require('../../validators/accountValidators'); 
const { checkOwnership } = require('../../middlewares/checkOwnership')

router.get('/', ctrl.list);
router.post('/', create, ctrl.create);
router.get('/:id', idParam, checkOwnership, ctrl.get);
router.put('/:id', update, checkOwnership, ctrl.update);
router.delete('/:id', idParam, checkOwnership, ctrl.remove);

module.exports = router;