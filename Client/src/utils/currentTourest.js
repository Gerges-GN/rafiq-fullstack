// UI identity is provided by AuthContext after GET /api/users/me verifies the token.
// Keep this module as a compatibility shim for older imports without reading stored roles.
export { useAuth as useCurrentTourist } from '../auth/AuthContext';
