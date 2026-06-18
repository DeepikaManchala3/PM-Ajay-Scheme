const express = require('express');
const router = express.Router();
const fundController = require('../controllers/fundController');

router.get('/', fundController.getAllFunds);
router.get('/annual-plan-approvals', fundController.getAnnualPlanApprovals);
router.post('/allocate', fundController.allocateFund);
router.post('/release', fundController.releaseFund);
router.get('/releases', fundController.getAllStateFundReleases);
router.get('/district-releases', fundController.getDistrictFundReleasesByState);
router.get('/district-stats', fundController.getDistrictStats);
router.post('/agency-release', fundController.releaseFundToAgency);
router.get('/agency-releases', fundController.getAgencyFundReleases);
router.get('/releases-to-district', fundController.getReleasesToDistrict);
router.get('/fix-allocations', fundController.fixFundAllocations);

module.exports = router;
