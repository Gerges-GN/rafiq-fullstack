const Place = require('../Models/Place');

const ALLOWED_CATEGORIES = ['Touristic', 'Historical'];

// POST /api/places/register  (or /api/places, your call)
exports.createPlace = async (req, res) => {
  try {
    const { name, city, category, imageUrl, description } = req.body;

    if (!name || !city || !category || !imageUrl) {
      return res
        .status(400)
        .json({ message: 'Name, city, category, and image URL are required.' });
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({ message: "Category must be either 'Touristic' or 'Historical'." });
    }

    const newPlace = await Place.create({ name, city, category, imageUrl, description });

    res.status(201).json(newPlace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/places/:id
exports.updatePlace = async (req, res) => {
  try {
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json(updatedPlace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/places/:id
exports.deletePlace = async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndDelete(req.params.id);

    if (!deletedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json({ message: 'Place deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/places/:id
exports.getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/places  (supports ?city=&category=&search=)
exports.getPlaces = async (req, res) => {
  try {
    const { city, category, search } = req.query;

    const filter = {};

    if (city && city !== 'All Cities') filter.city = city;
    if (category && category !== 'All Categories') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const places = await Place.find(filter).sort({ createdAt: -1 });

    res.status(200).json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};