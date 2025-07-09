const express = require('express');
const router = express.Router();
const usersController = require('../../controllers/admin/usersController');

router.get('/', usersController.getUsers);

module.exports = router;
