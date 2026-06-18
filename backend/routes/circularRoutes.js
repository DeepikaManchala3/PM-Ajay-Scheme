const express = require('express');
const router = express.Router();
const circularController = require('../controllers/circularController');

// Public routes (accessible to everyone)
router.get('/public', circularController.getAllCirculars);
router.get('/:id', circularController.getCircularById);

// Ministry routes (file upload and CRUD operations)
router.post('/upload', circularController.upload.single('file'), circularController.uploadFile);
router.post('/', circularController.createCircular);
router.put('/:id', circularController.updateCircular);
router.delete('/:id', circularController.deleteCircular);

module.exports = router;
