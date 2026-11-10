const Place = require('../Models/Place');
const Review = require('../Models/Review');

const ALLOWED_CATEGORIES = ['Touristic', 'Historical'];
const EDIT_FIELDS = ['name', 'city', 'category', 'imageUrl', 'description'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function pick(body) {
  return Object.fromEntries(EDIT_FIELDS.filter((field) => Object.hasOwn(body || {}, field)).map((field) => [field, body[field]]));
}

// POST /api/places/register  (or /api/places, your call)
exports.createPlace = async (req, res) => {
  try {
    const { name, city, category, imageUrl, description } = pick(req.body);

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
  } catch {
    res.status(500).json({ message: 'Unable to create place.' });
  }
};

// PUT /api/places/:id
exports.updatePlace = async (req, res) => {
  try {
    const updates = pick(req.body);
    if (!Object.keys(updates).length) return res.status(400).json({ message: 'No valid place fields provided.' });
    if (updates.category && !ALLOWED_CATEGORIES.includes(updates.category)) {
      return res.status(400).json({ message: 'Invalid place category.' });
    }
    const updatedPlace = await Place.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });

    if (!updatedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json(updatedPlace);
  } catch {
    res.status(400).json({ message: 'Unable to update place.' });
  }
};

// DELETE /api/places/:id
exports.deletePlace = async (req, res) => {
  try {
    if (await Review.exists({ placeId: req.params.id })) {
      return res.status(409).json({ message: 'This Place has reviews and cannot be deleted while those records exist.' });
    }
    const deletedPlace = await Place.findByIdAndDelete(req.params.id);

    if (!deletedPlace) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.status(200).json({ message: 'Place deleted successfully' });
  } catch {
    res.status(500).json({ message: 'Unable to delete place.' });
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
  } catch {
    res.status(500).json({ message: 'Unable to fetch place.' });
  }
};

// GET /api/places  (supports ?city=&category=&search=)
exports.getPlaces = async (req, res) => {
  try {
    const { city, category, search } = req.query;

    const filter = {};

    if (city && city !== 'All Cities') filter.city = city;
    if (category && category !== 'All Categories') filter.category = category;
    if (search && String(search).length > 100) {
      return res.status(400).json({ message: 'Search text must be 100 characters or fewer.' });
    }
    if (search) filter.name = { $regex: escapeRegex(String(search)), $options: 'i' };

    const places = await Place.find(filter).sort({ createdAt: -1 });

    res.status(200).json(places);
  } catch {
    res.status(500).json({ message: 'Unable to fetch places.' });
  }
};
