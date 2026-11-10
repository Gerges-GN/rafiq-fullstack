const express = require('express');
const router = express.Router();
const placeController = require('../Controllers/Place');
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/add', verifyToken, requireRole('admin'), placeController.createPlace);
router.put('/:id', verifyToken, requireRole('admin'), placeController.updatePlace);
router.delete('/:id', verifyToken, requireRole('admin'), placeController.deletePlace);
router.get('/:id', placeController.getPlaceById);
router.get('/', placeController.getPlaces);

module.exports = router;
