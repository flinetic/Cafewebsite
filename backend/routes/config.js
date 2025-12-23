const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');
const { uploadCafeLogo, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/public', configController.getPublicConfig);

// Protected routes - Admin only
router.use(protect);
router.use(adminOnly);

router.get('/', configController.getConfig);
router.put('/', configController.updateConfig);
router.put('/location', configController.updateLocation);
router.put('/radius', configController.updateRadius);
router.put('/theme', configController.updateTheme);
router.put('/hours', configController.updateOperatingHours);
router.put('/admin-limit', configController.updateAdminLimit);
router.put('/logo', uploadCafeLogo.single('logo'), handleUploadError, configController.updateLogoUrl);

module.exports = router;

