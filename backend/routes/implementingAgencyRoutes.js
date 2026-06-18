const express = require('express');
const router = express.Router();
const implementingAgencyController = require('../controllers/implementingAgencyController');

// Agency self-registration route
router.post('/register', implementingAgencyController.registerAgency);

// Get pending registrations (for State Admin)
router.get('/registrations/pending', implementingAgencyController.getPendingRegistrations);

// Approve/Reject registration
router.patch('/registrations/:id/approve', implementingAgencyController.approveRegistration);
router.patch('/registrations/:id/reject', implementingAgencyController.rejectRegistration);

// Get all implementing agencies for a state
router.get('/', implementingAgencyController.getImplementingAgencies);

// Create new implementing agency
router.post('/', implementingAgencyController.createImplementingAgency);

// Update implementing agency
router.put('/:id', implementingAgencyController.updateImplementingAgency);

// Activate implementing agency
router.patch('/:id/activate', implementingAgencyController.activateImplementingAgency);

module.exports = router;
