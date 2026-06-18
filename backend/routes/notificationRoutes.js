const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');


// Define notification routes
router.post('/send-allocation', notificationController.sendAllocationNotification);
router.post('/send-release', notificationController.sendReleaseNotification);
router.post('/send-activation-email', notificationController.sendActivationWhatsApp);

// Get notifications for a user
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Create test notification
router.post('/create-test', notificationController.createTestNotification);

module.exports = router;
