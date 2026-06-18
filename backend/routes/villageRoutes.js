const express = require('express');
const router = express.Router();
const {
    releaseVillageFunds,
    getVillageFundsByState,
    getVillageFundsByDistrict,
    getVillagesByDistrict,
    getVillageDetails,
    updateVillageFundUtilization,
    getVillageFundStats,
    releaseInstallment
} = require('../controllers/villageController');

// Release funds to villages
router.post('/release-funds', releaseVillageFunds);

// Release installment
router.post('/release-installment', releaseInstallment);

// Get village funds by state
router.get('/funds/state/:state', getVillageFundsByState);

// Get village funds by district
router.get('/funds/district/:district', getVillageFundsByDistrict);

// Get villages by district
router.get('/district/:district', getVillagesByDistrict);

// Get village details
router.get('/:villageCode', getVillageDetails);

// Update village fund utilization
router.put('/funds/:id/utilize', updateVillageFundUtilization);

// Get village fund statistics
router.get('/stats', getVillageFundStats);

module.exports = router;
