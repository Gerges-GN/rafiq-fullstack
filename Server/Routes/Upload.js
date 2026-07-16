const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { uploadImage } = require("../Controllers/Upload");

router.post("/image", upload.single("image"), uploadImage);

module.exports = router;