const express = require('express');
const router = express.Router();
const placeController = require('../Controllers/Place');

router.post('/add', placeController.createPlace);
router.put('/:id', placeController.updatePlace);
router.delete('/:id', placeController.deletePlace);
router.get('/:id', placeController.getPlaceById);
router.get('/', placeController.getPlaces);

module.exports = router;