const express = require('express');
const router = express.Router();
const {
    createGroceryShop,
    getAllGroceryShops,
    getGroceryShop,
    getMyShop,
    updateGroceryShop,
    deleteGroceryShop,
    addProduct,
    getShopProducts,
    updateProduct,
    deleteProduct,
} = require('../controllers/groceryController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllGroceryShops);
router.get('/:id', getGroceryShop);
router.get('/:shopId/products', getShopProducts);

// Protected routes (grocery shop owners)
router.post('/', protect, authorize('grocery'), createGroceryShop);
router.get('/my/shop', protect, authorize('grocery'), getMyShop);
router.put('/:id', protect, authorize('grocery', 'admin'), updateGroceryShop);
router.delete('/:id', protect, authorize('grocery', 'admin'), deleteGroceryShop);

// Product management
router.post('/products', protect, authorize('grocery'), addProduct);
router.put('/products/:id', protect, authorize('grocery', 'admin'), updateProduct);
router.delete('/products/:id', protect, authorize('grocery', 'admin'), deleteProduct);

module.exports = router;
