const express = require('express');
const router = express.Router();
const {
    registerNGO,
    getAllNGOs,
    getMyNGO,
    updateNGO,
    createDonation,
    getAvailableDonations,
    getMyDonations,
    requestDonation,
    acceptDonation,
    updateDonationStatus,
    getNGODonations,
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/auth');

// NGO routes
router.get('/ngos', getAllNGOs);
router.post('/ngo', protect, authorize('ngo'), registerNGO);
router.get('/ngo/my', protect, authorize('ngo'), getMyNGO);
router.put('/ngo/:id', protect, authorize('ngo', 'admin'), updateNGO);

// Donation routes
router.get('/available', getAvailableDonations);
router.post('/', protect, authorize('restaurant'), createDonation);
router.get('/my-donations', protect, authorize('restaurant'), getMyDonations);
router.get('/ngo/received', protect, authorize('ngo'), getNGODonations);
router.patch('/:id/request', protect, authorize('ngo'), requestDonation);
router.patch('/:id/accept', protect, authorize('restaurant'), acceptDonation);
router.patch('/:id/status', protect, authorize('restaurant', 'ngo', 'delivery'), updateDonationStatus);

module.exports = router;
