const express = require('express');
const router = express.Router();
const ucController = require('../controllers/ucController');

// Get UCs by state (for State Admin)
router.get('/state', ucController.getUCsByState);

// Get UCs by district (for District Admin)
router.get('/district/:districtId', ucController.getUCsByDistrict);

// Submit UC (District Admin)
router.post('/submit', ucController.submitUC);

// Verify UC (State Admin)
router.put('/verify/:id', ucController.verifyUC);

module.exports = router;
