// Authenticated smoke checks for the three documented synthetic account types.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');

const credentialsPath = path.join(__dirname, '..', '.demo-credentials');
const credentialLine = fs.existsSync(credentialsPath)
  ? fs.readFileSync(credentialsPath, 'utf8').split(/\r?\n/).find((line) => line.startsWith('DEMO_PASSWORD='))
  : null;
const password = process.env.DEMO_PASSWORD || credentialLine?.slice('DEMO_PASSWORD='.length).trim();
const apiBase = process.env.DEMO_API_BASE || 'http://localhost:5000/api';
if (!password) throw new Error('Local demo password was not found; run the data seeder first.');

async function request(pathname, token, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
}

async function login(email) {
  const response = await request('/users/login', null, { method: 'POST', body: JSON.stringify({ email, password }) });
  if (response.status !== 200 || !response.body?.token || Object.hasOwn(response.body.user || {}, 'password')) {
    throw new Error(`Login smoke check failed for ${email} (HTTP ${response.status}).`);
  }
  return { token: response.body.token, user: response.body.user, applicationStatus: response.body.guideApplicationStatus };
}

async function main() {
  const tourist = await login('demo.tourist.001@rafiq.test');
  const guide = await login('demo.guide.01@rafiq.test');
  const pending = await login('demo.pending.01@rafiq.test');
  const [touristMe, guideMe, pendingMe, touristBookings, guideTrips, publicGuides, publicPlaces] = await Promise.all([
    request('/users/me', tourist.token),
    request('/users/me', guide.token),
    request('/users/me', pending.token),
    request(`/bookings/tourist/${tourist.user._id}`, tourist.token),
    request(`/trips/tourguide/${guide.user._id}`, guide.token),
    request('/tourguide-profiles'),
    request('/places'),
  ]);
  if (touristMe.status !== 200 || touristMe.body.user.role !== 'tourist') throw new Error('Tourist identity check failed.');
  if (guideMe.status !== 200 || guideMe.body.user.role !== 'tourguide') throw new Error('Approved Guide identity check failed.');
  if (pendingMe.status !== 200 || pendingMe.body.user.role !== 'tourist' || pendingMe.body.user.guideApplicationStatus !== 'pending' || pending.applicationStatus !== 'pending') throw new Error('Pending applicant identity/status check failed.');
  if (touristBookings.status !== 200 || !Array.isArray(touristBookings.body) || touristBookings.body.some((booking) => String(booking.touristId) !== String(tourist.user._id))) throw new Error('Tourist booking ownership check failed.');
  if (guideTrips.status !== 200 || !Array.isArray(guideTrips.body) || guideTrips.body.some((trip) => String(trip.tourGuideId) !== String(guide.user._id))) throw new Error('Guide trip ownership check failed.');
  if (publicGuides.status !== 200 || publicGuides.body.length !== 25 || publicGuides.body.some((profile) => profile.status !== 'approved' || profile.verified !== true)) throw new Error('Public Guide approval filter check failed.');
  if (publicPlaces.status !== 200 || publicPlaces.body.length !== 24) throw new Error('Public Place listing check failed.');

  const pendingGuideWrite = await request('/trips', pending.token, {
    method: 'POST', body: JSON.stringify({ title: 'Should not publish', location: 'Cairo', days: 1 }),
  });
  if (pendingGuideWrite.status !== 403) throw new Error(`Pending Guide route gate check failed (HTTP ${pendingGuideWrite.status}).`);

  console.log(JSON.stringify({
    tourist: { login: 'passed', role: touristMe.body.user.role, bookings: touristBookings.body.length },
    approvedGuide: { login: 'passed', role: guideMe.body.user.role, trips: guideTrips.body.length },
    pendingGuide: { login: 'passed', applicationStatus: pendingMe.body.user.guideApplicationStatus, guideWriteDenied: pendingGuideWrite.status === 403 },
    publicGuides: publicGuides.body.length,
    publicPlaces: publicPlaces.body.length,
    passwordReturnedByApi: false,
  }, null, 2));
}

main().catch((error) => { console.error(`Demo account smoke check failed: ${error.message}`); process.exitCode = 1; });
