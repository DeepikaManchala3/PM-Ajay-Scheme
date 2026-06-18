const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

router.get('/states', trackingController.getStates);
router.get('/districts', trackingController.getDistricts);
router.get('/villages', trackingController.getVillages);
router.get('/projects', trackingController.getProjects); // List of projects dropdown

router.get('/', trackingController.getProjectLocations); // Existing map/stats data

module.exports = router;
