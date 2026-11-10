// One-at-a-time remote URL ingestion to keep client upload bandwidth negligible.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');
const User = require('../Models/User');
const Place = require('../Models/Place');
const Profile = require('../Models/TouristProfile');
const GuideProfile = require('../Models/TourGuideProfile');
const Trip = require('../Models/Trip');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const Post = require('../Models/Post');

const cacheFile = path.join(__dirname, '..', '.demo-image-cache.json');
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const photoId = (url) => url?.match(/images\.unsplash\.com\/(photo-[^?]+)/)?.[1];
const optimizedUrl = (url, format) => {
  const [beforeVersion, versionAndPath] = url.split('/upload/');
  if (!versionAndPath) return url;
  return `${beforeVersion}/upload/f_auto,q_auto:good,w_900,h_600,c_fill/${versionAndPath}`;
};

async function main() {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  if (required.some((key) => !process.env[key])) {
    console.log('Image upload skipped: Cloudinary credentials are not configured. Place records keep their optimized Unsplash URLs.');
    return;
  }
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) : {};
  await mongoose.connect(process.env.MONGO_URI);

  const demoUsers = await User.find({ email: /^demo\./i }).select('_id email').lean();
  const touristIds = demoUsers.filter((user) => user.email.startsWith('demo.tourist.') || user.email.startsWith('demo.pending.')).map((user) => user._id);
  const guideIds = demoUsers.filter((user) => user.email.startsWith('demo.guide.')).map((user) => user._id);
  const demoPlaceNames = ['Giza Plateau', 'Grand Egyptian Museum', 'Khan el-Khalili', 'Citadel of Saladin', 'Egyptian Museum', 'Karnak Temple Complex', 'Valley of the Kings', 'Luxor Temple', 'Philae Temple', 'Abu Simbel Temples', 'Nubian Museum', 'Bibliotheca Alexandrina', 'Qaitbay Citadel', 'Catacombs of Kom el Shoqafa', 'Abu al-Abbas al-Mursi Mosque', 'Hurghada Marina', 'Giftun Islands', 'El Mina Mosque', 'Ras Mohammed National Park', 'Naama Bay', 'Old Market', 'Al-Azhar Park', 'Deir el-Medina', 'Elephantine Island'];
  const docs = await Promise.all([
    Place.find({ name: { $in: demoPlaceNames }, imageUrl: /images\.unsplash\.com/ }),
    Profile.find({ owner: { $in: touristIds }, avatarUrl: /images\.unsplash\.com/ }),
    GuideProfile.find({ owner: { $in: [...guideIds, ...demoUsers.filter((user) => user.email.startsWith('demo.pending.')).map((user) => user._id)] }, avatarUrl: /images\.unsplash\.com/ }),
    Trip.find({ tourGuideId: { $in: guideIds }, images: /images\.unsplash\.com/ }),
    Booking.find({ touristId: { $in: touristIds }, $or: [{ touristimg: /images\.unsplash\.com/ }, { tourguideimg: /images\.unsplash\.com/ }] }),
    Review.find({ reviewerId: { $in: touristIds }, $or: [{ reviewerAvatarUrl: /images\.unsplash\.com/ }, { entityAvatarUrl: /images\.unsplash\.com/ }] }),
    Post.find({ owner: { $in: touristIds }, images: /images\.unsplash\.com/ }),
  ]);
  const [places, profiles, guides, trips, bookings, reviews, posts] = docs;
  const urls = new Map();
  const collect = (value) => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (typeof value === 'string') { const id = photoId(value); if (id && !urls.has(id)) urls.set(id, value); }
  };
  places.forEach((doc) => collect(doc.imageUrl));
  profiles.forEach((doc) => { collect(doc.avatarUrl); collect(doc.coverUrl); });
  guides.forEach((doc) => collect(doc.avatarUrl));
  trips.forEach((doc) => collect(doc.images));
  bookings.forEach((doc) => { collect(doc.touristimg); collect(doc.tourguideimg); });
  reviews.forEach((doc) => { collect(doc.reviewerAvatarUrl); collect(doc.entityAvatarUrl); });
  posts.forEach((doc) => collect(doc.images));

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  for (const [id, source] of urls) {
    if (!cache[id]) {
      let completed = false;
      for (let attempt = 1; attempt <= 3 && !completed; attempt++) {
        try {
          const result = await cloudinary.uploader.upload(source, {
            folder: 'rafiq-demo', public_id: id, overwrite: false, unique_filename: false,
            format: 'webp', quality: 'auto:good', width: 900, height: 600, crop: 'fill',
          });
          cache[id] = { url: result.secure_url, publicId: result.public_id };
          fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
          uploaded++;
          completed = true;
        } catch (error) {
          if (String(error?.message || '').includes('already exists')) {
            const result = await cloudinary.api.resource(`rafiq-demo/${id}`);
            cache[id] = { url: result.secure_url, publicId: result.public_id };
            fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
            skipped++;
            completed = true;
          } else if (attempt === 3) {
            failed++;
            console.error(`Image import failed for ${id} (attempt ${attempt}/3).`);
          } else await delay(1000 * 2 ** (attempt - 1));
        }
      }
      if (!cache[id]) continue;
    } else skipped++;
  }

  const replace = (url) => { const id = photoId(url); return id && cache[id]?.url ? optimizedUrl(cache[id].url, 'auto') : url; };
  for (const doc of places) { doc.imageUrl = replace(doc.imageUrl); await doc.save(); }
  for (const doc of profiles) { doc.avatarUrl = replace(doc.avatarUrl); doc.coverUrl = replace(doc.coverUrl); await doc.save(); }
  for (const doc of guides) { doc.avatarUrl = replace(doc.avatarUrl); await doc.save(); }
  for (const doc of trips) { doc.images = doc.images.map(replace); await doc.save(); }
  for (const doc of bookings) { doc.touristimg = replace(doc.touristimg); doc.tourguideimg = replace(doc.tourguideimg); await doc.save(); }
  for (const doc of reviews) { doc.reviewerAvatarUrl = replace(doc.reviewerAvatarUrl); doc.entityAvatarUrl = replace(doc.entityAvatarUrl); await doc.save(); }
  for (const doc of posts) { doc.images = doc.images.map(replace); await doc.save(); }
  console.log(`Image import finished: ${uploaded} newly uploaded, ${skipped} already cached, ${failed} failed. Sequential queue; WebP q_auto:good, 900×600 c_fill delivery.`);
}

main().catch((error) => { console.error(`Image import failed: ${error.message}`); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect(); });
