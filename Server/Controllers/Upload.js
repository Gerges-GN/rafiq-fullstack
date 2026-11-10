const { uploadFile } = require("../Services/Cloudinary");

function hasAllowedImageSignature(buffer) {
  if (!Buffer.isBuffer(buffer)) return false;
  const jpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return jpeg || png || webp;
}

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    if (!hasAllowedImageSignature(req.file.buffer)) {
      return res.status(400).json({ message: "Uploaded file is not a supported image." });
    }

    const result = await uploadFile(req.file.buffer, "profiles", "image");

    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch {
    res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = { uploadImage };
