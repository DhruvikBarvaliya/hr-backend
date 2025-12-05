// src/routes/holidays.js
const express = require('express');
const wrap = require('../utils/wrap');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
const validator = require('../validators/holidayValidator');
const holidayCtrl = require('../controllers/holidayController');

const router = express.Router();

/**
 * Public: GET holidays (any authenticated user)
 */
router.get('/', auth, wrap(holidayCtrl.listHolidays));

/**
 * Admin/HR: create, update, delete
 */
router.post('/', auth, permit('admin', 'hr'), wrap(async (req, res) => {
  const data = await validator.createHoliday.validateAsync(req.body, { abortEarly: false });
  req.body = data;
  return holidayCtrl.createHoliday(req, res);
}));

router.put('/:id', auth, permit('admin', 'hr'), wrap(async (req, res) => {
  const data = await validator.updateHoliday.validateAsync(req.body, { abortEarly: false });
  req.body = data;
  return holidayCtrl.updateHoliday(req, res);
}));

router.delete('/:id', auth, permit('admin', 'hr'), wrap(holidayCtrl.deleteHoliday));

module.exports = router;
