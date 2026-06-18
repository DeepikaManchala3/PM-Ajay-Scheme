const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');

// Get national overview statistics
router.get('/national-overview', monitorController.getNationalOverview);

// Get state-specific progress
router.get('/state/:stateName', monitorController.getStateProgress);

module.exports = router;
