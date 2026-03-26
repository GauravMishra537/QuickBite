const express = require('express');
const router = express.Router();
const {
    getPlatformStats,
    getAllUsers,
    toggleUserStatus,
    getAllOrders,
    getAllRestaurants,
    toggleRestaurantStatus,
    getAllCloudKitchens,
    toggleCloudKitchenStatus,
    getAllGroceryShops,
    toggleGroceryShopStatus,
    getAllNGOs,
    toggleNGOStatus,
    getAllDeliveryPartners,
    toggleDeliveryPartnerStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/orders', getAllOrders);
router.get('/restaurants', getAllRestaurants);
router.patch('/restaurants/:id/toggle', toggleRestaurantStatus);
router.get('/cloud-kitchens', getAllCloudKitchens);
router.patch('/cloud-kitchens/:id/toggle', toggleCloudKitchenStatus);
router.get('/grocery-shops', getAllGroceryShops);
router.patch('/grocery-shops/:id/toggle', toggleGroceryShopStatus);
router.get('/ngos', getAllNGOs);
router.patch('/ngos/:id/toggle', toggleNGOStatus);
router.get('/delivery-partners', getAllDeliveryPartners);
router.patch('/delivery-partners/:id/toggle', toggleDeliveryPartnerStatus);

module.exports = router;
