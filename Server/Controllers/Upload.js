const { uploadFile } = require("../Services/Cloudinary");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const result = await uploadFile(req.file.buffer, "profiles", "image");

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
};

module.exports = { uploadImage };