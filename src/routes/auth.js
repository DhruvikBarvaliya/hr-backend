const express = require('express');
const wrap = require('../utils/wrap');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', wrap(authController.register));
router.post('/login', wrap(authController.login));

module.exports = router;
