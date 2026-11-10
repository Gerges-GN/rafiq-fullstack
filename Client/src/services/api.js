import { authFetch } from './authFetch';

const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await authFetch(`${BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export function fetchStats() { return request('/admin/stats'); }
export function fetchChart() { return request('/admin/chart'); }
export function fetchClassifications() { return request('/admin/classifications'); }
export function fetchIncidents() { return request('/admin/incidents'); }

export function fetchReviews(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/reviews${query ? `?${query}` : ''}`);
}

export function fetchFraud(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/admin/fraud${query ? `?${query}` : ''}`);
}

export function flagReview({ id, reason }) {
  return request('/admin/fraud/flag', { method: 'POST', body: JSON.stringify({ id, reason }) });
}

export function unflagReview({ id }) {
  return request('/admin/fraud/unflag', { method: 'POST', body: JSON.stringify({ id }) });
}

export function fetchReports() { return request('/admin/reports'); }
export function fetchChats() { return request('/admin/chats'); }
export function fetchChatDetails(id) { return request(`/admin/chats/${id}`); }
export function deleteChat(id) { return request(`/admin/chats/${id}`, { method: 'DELETE' }); }

export default {
  fetchStats, fetchChart, fetchClassifications, fetchIncidents, fetchReviews,
  fetchFraud, flagReview, unflagReview, fetchReports, fetchChats, fetchChatDetails, deleteChat,
};
