const express = require('express');
const router = express.Router();
const {
    createCloudKitchen,
    getAllCloudKitchens,
    getCloudKitchen,
    getMyKitchen,
    updateCloudKitchen,
    deleteCloudKitchen,
    toggleKitchenStatus,
} = require('../controllers/cloudKitchenController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllCloudKitchens);
router.get('/:id', getCloudKitchen);

// Protected routes (cloud kitchen owners)
router.post('/', protect, authorize('cloudkitchen'), createCloudKitchen);
router.get('/my/kitchen', protect, authorize('cloudkitchen'), getMyKitchen);
router.put('/:id', protect, authorize('cloudkitchen', 'admin'), updateCloudKitchen);
router.delete('/:id', protect, authorize('cloudkitchen', 'admin'), deleteCloudKitchen);
router.patch('/:id/toggle-status', protect, authorize('cloudkitchen'), toggleKitchenStatus);

module.exports = router;
