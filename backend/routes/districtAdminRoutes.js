const express = require('express');
const router = express.Router();
const districtAdminController = require('../controllers/districtAdminController');

router.get('/', districtAdminController.getAllDistrictAdmins);
router.post('/', districtAdminController.addDistrictAdmin);
router.put('/:id', districtAdminController.updateDistrictAdmin);
router.patch('/:id/activate', districtAdminController.activateDistrictAdmin);

module.exports = router;
