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

// Protected routes — must be before /:id to avoid being caught by param routes
router.get('/my/shop', protect, authorize('grocery'), getMyShop);
router.post('/', protect, authorize('grocery'), createGroceryShop);

// Public routes
router.get('/', getAllGroceryShops);
router.get('/:id', getGroceryShop);
router.get('/:shopId/products', getShopProducts);

// Shop management
router.put('/:id', protect, authorize('grocery', 'admin'), updateGroceryShop);
router.delete('/:id', protect, authorize('grocery', 'admin'), deleteGroceryShop);

// Product management (both /products and /:shopId/products for dashboard compat)
router.post('/products', protect, authorize('grocery'), addProduct);
router.post('/:shopId/products', protect, authorize('grocery'), addProduct);
router.put('/products/:id', protect, authorize('grocery', 'admin'), updateProduct);
router.put('/:shopId/products/:id', protect, authorize('grocery', 'admin'), updateProduct);
router.delete('/products/:id', protect, authorize('grocery', 'admin'), deleteProduct);
router.delete('/:shopId/products/:id', protect, authorize('grocery', 'admin'), deleteProduct);

module.exports = router;
