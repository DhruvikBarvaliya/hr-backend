const express = require('express');
const wrap = require('../utils/wrap');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
const empCtrl = require('../controllers/employeeController');

const router = express.Router();

router.post('/', auth, permit('admin', 'hr'), wrap(empCtrl.createEmployee));
router.get('/', auth, permit('admin', 'hr', 'manager'), wrap(empCtrl.getEmployees));

module.exports = router;
