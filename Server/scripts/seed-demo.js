// Safe, repeatable demo-data seeder. This script never clears collections.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const User = require('../Models/User');
const Profile = require('../Models/TouristProfile');
const GuideProfile = require('../Models/TourGuideProfile');
const Place = require('../Models/Place');
const Trip = require('../Models/Trip');
const Booking = require('../Models/Booking');
const Review = require('../Models/Review');
const Post = require('../Models/Post');
const Chat = require('../Models/Chat');
const { buildDemoIdentityPlan } = require('../Services/demoIdentity');

const credentialFile = path.join(__dirname, '..', '.demo-credentials');
const imageCacheFile = path.join(__dirname, '..', '.demo-image-cache.json');
const avatarDirectory = path.join(__dirname, '..', '..', 'Client', 'public', 'avatars');
const avatarFiles = fs.existsSync(avatarDirectory)
  ? fs.readdirSync(avatarDirectory).filter((file) => /\.(png|jpe?g|webp)$/i.test(file)).sort()
  : [];
if (avatarFiles.length === 0) throw new Error('No local demo avatars were found in Client/public/avatars.');
if (!process.env.DEMO_PASSWORD && !fs.existsSync(credentialFile)) {
  const generatedPassword = `RafiqDemo-${crypto.randomBytes(15).toString('base64url')}!`;
  fs.writeFileSync(credentialFile, `DEMO_PASSWORD=${generatedPassword}\n`, { flag: 'wx', mode: 0o600 });
}
if (!process.env.DEMO_PASSWORD && fs.existsSync(credentialFile)) {
  const line = fs.readFileSync(credentialFile, 'utf8').split(/\r?\n/).find((entry) => entry.startsWith('DEMO_PASSWORD='));
  if (line) process.env.DEMO_PASSWORD = line.slice('DEMO_PASSWORD='.length).trim();
}
const demoPassword = process.env.DEMO_PASSWORD;
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required.');
if (!demoPassword || demoPassword.length < 12 || Buffer.byteLength(demoPassword, 'utf8') > 72) {
  throw new Error('Set DEMO_PASSWORD to a local-only demo password of 12–72 bytes.');
}

const cities = ['Cairo', 'Giza', 'Luxor', 'Aswan', 'Alexandria', 'Hurghada', 'Sharm El Sheikh'];
const cityImages = {
  Cairo: 'photo-1572252009286-268acec5ca0a', Giza: 'photo-1539768942893-daf53e448371',
  Luxor: 'photo-1568322445389-f64ac2515020', Aswan: 'photo-1560157368-946d9c8f7cb6',
  Alexandria: 'photo-1577083552431-6e5fd01aa342', Hurghada: 'photo-1530789253388-582c481c54b0',
  'Sharm El Sheikh': 'photo-1510414842594-a61c69b5ae57',
};
const imageCache = fs.existsSync(imageCacheFile) ? JSON.parse(fs.readFileSync(imageCacheFile, 'utf8')) : {};
let hasExistingDemoData = false;
function image(city, width = 900) {
  const sourceId = cityImages[city];
  const cached = imageCache[sourceId]?.url;
  if (cached) {
    const [base, versionPath] = cached.split('/upload/');
    if (versionPath) return `${base}/upload/f_auto,q_auto:good,w_${width},h_${Math.round(width * 2 / 3)},c_fill/${versionPath}`;
    return cached;
  }
  if (hasExistingDemoData) {
    throw new Error(`The image cache has no Cloudinary assignment for ${city}; refusing to replace existing demo images with Unsplash URLs.`);
  }
  return `https://images.unsplash.com/${sourceId}?auto=format&fit=crop&w=${width}&q=78`;
}
const places = [
  ['Giza Plateau', 'Giza', 'Historical', 'Walk among the Great Pyramid, Khafre’s pyramid, and the Sphinx on the edge of the desert.'],
  ['Grand Egyptian Museum', 'Giza', 'Historical', 'A landmark collection beside the Giza pyramids, presenting Egypt’s ancient heritage.'],
  ['Khan el-Khalili', 'Cairo', 'Touristic', 'A historic bazaar of workshops, coffee houses, spices, and narrow lanes in Islamic Cairo.'],
  ['Citadel of Saladin', 'Cairo', 'Historical', 'A hilltop medieval fortress with sweeping views over historic Cairo.'],
  ['Egyptian Museum', 'Cairo', 'Historical', 'Explore royal mummies, sculpture, jewelry, and objects from across ancient Egypt.'],
  ['Karnak Temple Complex', 'Luxor', 'Historical', 'A vast sanctuary of pylons, obelisks, and the celebrated Great Hypostyle Hall.'],
  ['Valley of the Kings', 'Luxor', 'Historical', 'Royal tombs cut into the Theban hills, including richly decorated New Kingdom chambers.'],
  ['Luxor Temple', 'Luxor', 'Historical', 'A riverside temple whose monumental colonnade is especially atmospheric after sunset.'],
  ['Philae Temple', 'Aswan', 'Historical', 'A graceful island sanctuary dedicated to Isis, reached by a short boat ride.'],
  ['Abu Simbel Temples', 'Aswan', 'Historical', 'Ramses II’s monumental rock-cut temples overlooking Lake Nasser.'],
  ['Nubian Museum', 'Aswan', 'Historical', 'A thoughtful introduction to Nubian history, archaeology, and living culture.'],
  ['Bibliotheca Alexandrina', 'Alexandria', 'Touristic', 'A striking contemporary library and cultural center on Alexandria’s waterfront.'],
  ['Qaitbay Citadel', 'Alexandria', 'Historical', 'A 15th-century sea fort built near the site of the ancient Lighthouse of Alexandria.'],
  ['Catacombs of Kom el Shoqafa', 'Alexandria', 'Historical', 'A remarkable underground burial complex blending Egyptian, Greek, and Roman styles.'],
  ['Abu al-Abbas al-Mursi Mosque', 'Alexandria', 'Historical', 'An ornate landmark mosque in the historic Anfushi district.'],
  ['Hurghada Marina', 'Hurghada', 'Touristic', 'A lively Red Sea harbor promenade with cafés, boats, and evening views.'],
  ['Giftun Islands', 'Hurghada', 'Touristic', 'A marine reserve known for clear water, coral reefs, and boat excursions.'],
  ['El Mina Mosque', 'Hurghada', 'Historical', 'A landmark white-stone mosque near the marina and fishing harbor.'],
  ['Ras Mohammed National Park', 'Sharm El Sheikh', 'Touristic', 'A protected headland with coral reefs, desert scenery, and clear swimming coves.'],
  ['Naama Bay', 'Sharm El Sheikh', 'Touristic', 'A sheltered Red Sea bay with a beachfront promenade and access to local dive sites.'],
  ['Old Market', 'Sharm El Sheikh', 'Touristic', 'A colorful evening market for local food, crafts, and the historic mosque.'],
  ['Al-Azhar Park', 'Cairo', 'Touristic', 'Green gardens and city panoramas beside the medieval quarters of Cairo.'],
  ['Deir el-Medina', 'Luxor', 'Historical', 'The preserved village of the artisans who built and decorated royal tombs.'],
  ['Elephantine Island', 'Aswan', 'Touristic', 'A Nile island of Nubian villages, archaeological sites, and quiet river paths.'],
];
const guideCities = ['Cairo', 'Giza', 'Cairo', 'Luxor', 'Aswan', 'Alexandria', 'Luxor', 'Cairo', 'Hurghada', 'Aswan', 'Sharm El Sheikh', 'Giza', 'Alexandria', 'Luxor', 'Hurghada', 'Cairo', 'Aswan', 'Sharm El Sheikh', 'Giza', 'Alexandria', 'Luxor', 'Hurghada', 'Aswan', 'Cairo', 'Sharm El Sheikh'];
const biosByCity = {
  Cairo: ['I connect the stories of old Cairo with its food, crafts, and everyday life.', 'I lead relaxed walks through Islamic Cairo and help guests discover its architecture and markets.'],
  Giza: ['I make the Giza plateau easier to understand with clear history and a comfortable pace.', 'I share the stories of the pyramids and Sphinx, with time for photos and questions.'],
  Luxor: ['I lead thoughtful temple visits and help guests notice details across the Theban landscape.', 'I specialize in Luxor’s temples, tombs, and the history of the artisans who built them.'],
  Aswan: ['I share Nubian heritage, Nile-side walks, and practical advice for exploring Aswan.', 'My tours connect Aswan’s island temples with local history and riverside life.'],
  Alexandria: ['I share Alexandria’s layered history, from its seafront fort to its café culture.', 'I lead coastal walks through Alexandria’s Greco-Roman landmarks and historic neighborhoods.'],
  Hurghada: ['I help visitors enjoy Hurghada’s Red Sea coast, boat trips, and local waterfront.', 'I focus on marine life, reef-safe outings, and relaxed days around Hurghada.'],
  'Sharm El Sheikh': ['I guide relaxed Red Sea days around Sharm’s bays, reefs, and desert edge.', 'I share local knowledge about Sharm’s coast, snorkeling spots, and evening markets.'],
};
const interests = ['architecture and food', 'photography and museums', 'slow travel and local markets', 'diving and marine life', 'ancient history and walking tours'];
const reviewTexts = [
  'Our guide explained the context clearly and gave us plenty of time to explore on our own.',
  'A relaxed, well-paced visit with helpful local details that made the place come alive.',
  'Thoughtful recommendations and a genuine feel for the neighborhood. I would book again.',
  'The route was easy to follow and the stories added a lot to what we saw.',
  'A memorable afternoon with practical tips, good conversation, and no rush.',
];

async function upsert(Model, filter, values) {
  const doc = await Model.findOneAndUpdate(filter, { $set: values }, { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true });
  return doc;
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  // The known pre-demo accounts are sacred. The configured DB contains the stated
  // two Tourists and one Admin plus one existing Guide account; preserve all four.
  const nonDemoUsers = await User.find({ email: { $not: /^demo\./i } }).select('_id email role name').lean();
  const roles = nonDemoUsers.reduce((counts, user) => ({ ...counts, [user.role]: (counts[user.role] || 0) + 1 }), {});
  const hasUnexpectedRole = Object.keys(roles).some((role) => !['tourist', 'admin', 'tourguide'].includes(role));
  const demoNamespaceUsers = await User.find({ email: /^demo\./i }).select('_id name email role').lean();
  const existingCloudinaryPlaces = await Place.exists({
    name: { $in: places.map(([name]) => name) },
    imageUrl: /res\.cloudinary\.com/i,
  });
  hasExistingDemoData = demoNamespaceUsers.length > 0 || Boolean(existingCloudinaryPlaces);
  if (hasExistingDemoData) {
    const missingImageSources = Object.values(cityImages).filter((sourceId) => !imageCache[sourceId]?.url);
    if (missingImageSources.length) {
      throw new Error('Safety stop: the Cloudinary image cache is incomplete for existing demo data; refusing to replace working image assignments.');
    }
  }
  const knownDemoAccount = (user) => {
    const tourist = user.email.match(/^demo\.tourist\.(\d{3})@rafiq\.test$/i);
    const guide = user.email.match(/^demo\.guide\.(\d{2})@rafiq\.test$/i);
    const pending = user.email.match(/^demo\.pending\.(\d{2})@rafiq\.test$/i);
    return (
      (tourist && Number(tourist[1]) >= 1 && Number(tourist[1]) <= 100 && user.role === 'tourist') ||
      (guide && Number(guide[1]) >= 1 && Number(guide[1]) <= 25 && user.role === 'tourguide') ||
      (pending && Number(pending[1]) >= 1 && Number(pending[1]) <= 5 && ['tourist', 'tourguide'].includes(user.role))
    );
  };
  if (![3, 4].includes(nonDemoUsers.length) || roles.tourist !== 2 || roles.admin !== 1 || (roles.tourguide || 0) > 1 || hasUnexpectedRole || demoNamespaceUsers.some((user) => !knownDemoAccount(user))) {
    throw new Error(`Safety stop: expected the two original tourists and one admin, with at most the one pre-existing Guide; found ${nonDemoUsers.length} non-demo users and an unrecognized reserved demo account.`);
  }
  const pendingApplications = demoNamespaceUsers.filter((user) => user.email.startsWith('demo.pending.'));
  for (const user of pendingApplications) {
    const profile = await GuideProfile.findOne({ owner: user._id }).select('status verified').lean();
    const approvedGuide = user.role === 'tourguide' && profile?.status === 'approved' && profile.verified === true;
    const nonGuideApplication = user.role === 'tourist' && (!profile || ['pending', 'rejected', 'suspended'].includes(profile.status));
    if (!approvedGuide && !nonGuideApplication) {
      throw new Error('Safety stop: a reserved demo applicant has an inconsistent account role and Guide-profile status. No records were changed.');
    }
  }
  const identityPlan = buildDemoIdentityPlan(avatarFiles, nonDemoUsers.map((user) => user.name));
  const counts = { tourists: 0, guides: 0, pendingGuides: 0, places: 0, trips: 0, bookings: 0, reviews: 0, posts: 0, chats: 0 };
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const tourists = [];
  const touristAvatars = new Map();
  for (let i = 1; i <= 100; i++) {
    const email = `demo.tourist.${String(i).padStart(3, '0')}@rafiq.test`;
    const { name, avatarUrl } = identityPlan.get(email);
    const city = cities[(i - 1) % cities.length];
    const user = await upsert(User, { email }, { name, email, password: passwordHash, role: 'tourist', location: `${city}, Egypt` });
    tourists.push(user);
    touristAvatars.set(String(user._id), avatarUrl);
    await upsert(Profile, { owner: user._id }, { owner: user._id, ownerName: name, headline: `Exploring Egypt from ${city}`, bio: `Curious traveler interested in ${interests[(i - 1) % interests.length]}.`, location: `${city}, Egypt`, languages: i % 3 === 0 ? ['English', 'Arabic'] : ['English'], num_trips: 1 + (i % 8), num_posts: 0, avatarUrl, coverUrl: image(city, 1200) });
    counts.tourists++;
  }

  const guides = [];
  for (let i = 0; i < 25; i++) {
    const email = `demo.guide.${String(i + 1).padStart(2, '0')}@rafiq.test`;
    const { name, avatarUrl } = identityPlan.get(email);
    const city = guideCities[i];
    const user = await upsert(User, { email }, { name, email, password: passwordHash, role: 'tourguide', location: `${city}, Egypt` });
    const cityBios = biosByCity[city] || biosByCity.Cairo;
    const profile = await upsert(GuideProfile, { owner: user._id }, { owner: user._id, name, email, city, role: 'guide', avatarUrl, bio: cityBios[i % cityBios.length], languages: i % 4 === 0 ? ['Arabic', 'English', 'French'] : i % 3 === 0 ? ['Arabic', 'English', 'German'] : ['Arabic', 'English'], rate: String(25 + (i % 6) * 10), status: 'approved', verified: true, rating: 4.6 + (i % 5) * 0.08, reviews: 8 + (i % 17), completedTrips: 15 + (i % 40) });
    guides.push({ user, profile, city });
    counts.guides++;
  }
  for (let i = 1; i <= 5; i++) {
    const city = cities[(i + 1) % cities.length];
    const email = `demo.pending.${String(i).padStart(2, '0')}@rafiq.test`;
    const { name, avatarUrl } = identityPlan.get(email);
    const existingUser = await User.findOne({ email }).select('_id role').lean();
    const existingApplication = existingUser
      ? await GuideProfile.findOne({ owner: existingUser._id }).select('status verified').lean()
      : null;
    const applicationStatus = existingApplication?.status || 'pending';
    const applicationVerified = existingApplication?.verified === true;
    const accountRole = applicationStatus === 'approved' && applicationVerified ? 'tourguide' : 'tourist';
    const user = await upsert(User, { email }, { name, email, password: passwordHash, role: accountRole, location: `${city}, Egypt` });
    const cityBios = biosByCity[city] || biosByCity.Cairo;
    await upsert(Profile, { owner: user._id }, { owner: user._id, ownerName: name, headline: `Guide application for ${city}`, bio: cityBios[i % cityBios.length], location: `${city}, Egypt`, languages: ['Arabic', 'English'], avatarUrl, coverUrl: image(city, 1200) });
    await upsert(GuideProfile, { owner: user._id }, { owner: user._id, name, email, city, role: 'guide', avatarUrl, bio: cityBios[i % cityBios.length], languages: ['Arabic', 'English'], phone: `+20 10 5550 ${String(i).padStart(4, '0')}`, status: applicationStatus, verified: applicationVerified });
    counts.pendingGuides++;
  }

  const placeDocs = [];
  for (const [name, city, category, description] of places) {
    placeDocs.push(await upsert(Place, { name, city }, { name, city, category, description, imageUrl: image(city) }));
    counts.places++;
  }

  const trips = [];
  for (let i = 0; i < 30; i++) {
    const guide = guides[i % guides.length];
    const cityPlaces = placeDocs.filter((place) => place.city === guide.city);
    const selected = cityPlaces[i % cityPlaces.length] || placeDocs[i % placeDocs.length];
    const routeTitle = [`Old City Stories and Tastes`, `Landmarks at a Local Pace`, `A Day of History and Hidden Corners`, `Nile Views and Neighborhood Life`, `First Look at ${selected.city}`][i % 5];
    const title = `${routeTitle} — ${i < guides.length ? 'Signature' : 'Alternative'} route`;
    trips.push(await upsert(Trip, { tourGuideId: guide.user._id, title }, { tourGuideId: guide.user._id, title, location: `${selected.city}, Egypt`, days: 1 + (i % 3), details: `${selected.name} and nearby highlights, with time for questions, photos, and a locally recommended break.`, images: [image(selected.city)] }));
    counts.trips++;
  }

  const bookings = [];
  for (let i = 0; i < 75; i++) {
    const trip = trips[i % trips.length];
    const guide = guides.find((item) => String(item.user._id) === String(trip.tourGuideId));
    const tourist = tourists[(i * 13) % tourists.length];
    const status = i % 7 === 0 ? 'Pending' : i % 5 === 0 ? 'Cancelled' : i % 4 === 0 ? 'Completed' : 'Confirmed';
    const createdAt = new Date(Date.UTC(2026, 0, 1) + i * 86400000);
    bookings.push(await upsert(Booking, { touristId: tourist._id, tripId: trip._id }, { touristId: tourist._id, touristName: tourist.name, touristimg: touristAvatars.get(String(tourist._id)), tourGuideId: guide.user._id, tourGuideName: guide.user.name, tourguideimg: guide.profile.avatarUrl, tripId: trip._id, tripTitle: trip.title, duration: `${trip.days} ${trip.days === 1 ? 'Day' : 'Days'}`, status, createdAt }));
    counts.bookings++;
  }

  for (let i = 0; i < 120; i++) {
    const tourist = tourists[(i * 17) % tourists.length];
    const rating = [5, 5, 4, 5, 4, 3][i % 6];
    const targetType = i % 2 === 0 ? 'Guide' : 'Place';
    const target = targetType === 'Guide' ? guides[(i * 3 + Math.floor(i / tourists.length)) % guides.length] : null;
    const place = targetType === 'Place' ? placeDocs[(i * 5 + Math.floor(i / tourists.length)) % placeDocs.length] : null;
    const key = targetType === 'Guide' ? { reviewerId: tourist._id, entityType: 'Guide', tourGuideId: target.user._id } : { reviewerId: tourist._id, entityType: 'Place', placeId: place._id };
    const targetName = targetType === 'Guide' ? target.profile.name : place.name;
    await upsert(Review, key, { ...key, reviewerName: tourist.name, reviewerAvatarUrl: touristAvatars.get(String(tourist._id)), entityName: targetType === 'Guide' ? target.user.name : targetName, entityAvatarUrl: targetType === 'Guide' ? target.profile.avatarUrl : place.imageUrl, rating, text: reviewTexts[i % reviewTexts.length], status: 'PUBLISHED', flagged: false });
    counts.reviews++;
  }

  for (let i = 0; i < 16; i++) {
    const tourist = tourists[(i * 11) % tourists.length];
    const place = placeDocs[(i * 3) % placeDocs.length];
    const title = [`A morning around ${place.name}`, `Notes from ${place.city}`, `Three details I loved in ${place.city}`, `A first visit to ${place.name}`][i % 4];
    const post = await upsert(Post, { owner: tourist._id, title }, { owner: tourist._id, title, tripLocation: `${place.city}, Egypt`, description: `A small travel note from ${place.city}: ${place.description}`, images: [place.imageUrl], numLikes: 8 + (i * 7) % 90 });
    await Profile.updateOne({ owner: tourist._id }, { $addToSet: { posts: post._id }, $max: { num_posts: 1 } });
    counts.posts++;
  }

  for (let i = 0; i < 12; i++) {
    const tourist = tourists[(i * 7) % tourists.length];
    const guide = guides[(i * 2) % guides.length];
    const messageBase = Date.UTC(2026, 9, 15) - i * 86400000;
    const messages = [
      { writerId: tourist._id, content: `Hello ${guide.profile.name.split(' ')[0]}, is ${guide.city} suitable for a relaxed half-day visit?`, createdAt: new Date(messageBase) },
      { writerId: guide.user._id, content: `Absolutely. I can suggest a comfortable route and we can adjust it to your interests.`, createdAt: new Date(messageBase + 3600000) },
      { writerId: tourist._id, content: `That sounds great. I am especially interested in local history and food.`, createdAt: new Date(messageBase + 7200000) },
    ];
    await upsert(Chat, { touristId: tourist._id, tourGuideId: guide.user._id }, { touristId: tourist._id, tourGuideId: guide.user._id, messages });
    counts.chats++;
  }

  console.log('Demo seed complete (no existing non-demo users were modified):');
  for (const [entity, count] of Object.entries(counts)) console.log(`  ${entity}: ${count}`);
  console.log(`  existing non-demo users preserved: ${nonDemoUsers.length}`);
}

run().catch((error) => {
  console.error(`Demo seed failed: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
