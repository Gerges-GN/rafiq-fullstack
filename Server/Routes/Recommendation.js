const express = require("express");
const router = express.Router();
const { recommendPlaces } = require("../Controllers/Recommendation");

router.post("/recommend-places", recommendPlaces);

module.exports = router;