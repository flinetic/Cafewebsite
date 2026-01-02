const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');

// Public routes
router.get('/active', offerController.getActiveOffers);
router.get('/upcoming', offerController.getUpcomingOffers);

// Protected routes (admin only)
router.use(protect, adminOnly);

router.route('/')
    .get(offerController.getAllOffers)
    .post(offerController.createOffer);

router.route('/:id')
    .get(offerController.getOfferById)
    .put(offerController.updateOffer)
    .delete(offerController.deleteOffer);

router.patch('/:id/toggle', offerController.toggleOfferStatus);

module.exports = router;
