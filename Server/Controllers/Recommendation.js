const Place = require("../Models/Place");
const { getPlaceRecommendations } = require("../Services/Recommendation");

const recommendPlaces = async (req, res) => {
  try {
    const description = req.body?.description;

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ message: "Please describe what you're looking for." });
    }
    if (description.trim().length > 1000) {
      return res.status(400).json({ message: "Please keep your trip description under 1,000 characters." });
    }

    // Pull all places from our own DB — the model only picks among these,
    // it never invents a place.
    const places = await Place.find({});

    if (places.length === 0) {
      return res.status(200).json({ recommendations: [] });
    }

    const aiPicks = await getPlaceRecommendations(description, places);

    // Map the AI's { id, reason } picks back to full place documents,
    // preserving the AI's ranking order and dropping any ids it hallucinated.
    const placesById = new Map(places.map((p) => [p._id.toString(), p]));

    const recommendations = aiPicks
      .filter((pick) => placesById.has(pick.id))
      .map((pick) => ({
        ...placesById.get(pick.id).toObject(),
        reason: pick.reason,
      }));

    res.status(200).json({ recommendations });
  } catch {
    res.status(502).json({ message: "Trip recommendations are temporarily unavailable." });
  }
};

module.exports = { recommendPlaces };
