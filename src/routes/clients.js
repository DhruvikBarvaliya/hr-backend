// src/routes/clients.js
const express = require('express');
const wrap = require('../utils/wrap');
const auth = require('../middlewares/auth');
const permit = require('../middlewares/roles');
const validator = require('../validators/clientValidator');
const clientCtrl = require('../controllers/clientController');

const router = express.Router();

// list (admin/hr/manager)
router.get('/', auth, permit('admin', 'hr', 'manager'), wrap(clientCtrl.listClients));

// create (admin/hr)
router.post('/', auth, permit('admin', 'hr'), wrap(async (req, res) => {
  const data = await validator.createClient.validateAsync(req.body, { abortEarly: false });
  req.body = data;
  return clientCtrl.createClient(req, res);
}));

// get secret (admin only)
router.get('/:id/secret', auth, permit('admin'), wrap(clientCtrl.getClientSecret));

// update & delete
router.put('/:id', auth, permit('admin', 'hr'), wrap(async (req, res) => {
  const data = await validator.updateClient.validateAsync(req.body, { abortEarly: false });
  req.body = data;
  return clientCtrl.updateClient(req, res);
}));

router.delete('/:id', auth, permit('admin', 'hr'), wrap(clientCtrl.deleteClient));

module.exports = router;
