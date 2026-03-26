const express = require('express');
const router = express.Router();
const { createReview, getEntityReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/:entityId', getEntityReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
