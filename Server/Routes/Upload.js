const express = require("express");
const router = express.Router();
const upload = require("../Middleware/upload");
const { uploadImage } = require("../Controllers/Upload");
const { verifyToken, requireRole } = require('../Middleware/Auth');

router.post('/image', verifyToken, requireRole('tourist', 'tourguide', 'admin'), upload.single('image'), uploadImage);

module.exports = router;
