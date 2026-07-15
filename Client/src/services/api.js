const BASE = import.meta.env.VITE_API_URL || "/api";

async function getJson(path) {
  const url = `${BASE}${path}`;

  console.log("Requesting:", url);

  const res = await fetch(url);

  const text = await res.text();

  console.log("Status:", res.status);
  console.log("Response:", text);

  if (!res.ok) {
    throw new Error(`Request failed ${res.status}`);
  }

  return JSON.parse(text);
}

export async function fetchStats() {
  return getJson('/admin/stats')
}

export async function fetchChart() {
  return getJson('/admin/chart')
}

export async function fetchClassifications() {
  return getJson('/admin/classifications')
}

export async function fetchIncidents() {
  return getJson('/admin/incidents')
}

export async function fetchReviews(params = {}) {
  const query = new URLSearchParams(params).toString()
  return getJson(`/admin/reviews${query ? `?${query}` : ''}`)
}

export async function fetchFraud(params = {}) {
  const query = new URLSearchParams(params).toString()
  return getJson(`/admin/fraud${query ? `?${query}` : ''}`)
}

export async function flagReview({ id, reason }) {
  const res = await fetch(`${BASE}/admin/fraud/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, reason }),
  })
  if (!res.ok) throw new Error('Flag request failed')
  return res.json()
}

export async function unflagReview({ id }) {
  const res = await fetch(`${BASE}/admin/fraud/unflag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Unflag request failed')
  return res.json()
}

export async function fetchReports() {
  return getJson('/admin/reports')
}

export async function fetchChats() {
  return getJson('/admin/chats')
}

export async function fetchChatDetails(id) {
  return getJson(`/admin/chats/${id}`)
}

export async function deleteChat(id) {
  const res = await fetch(`${BASE}/admin/chats/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Delete chat request failed')
  return res.json()
}

export default { fetchStats, fetchChart, fetchClassifications, fetchIncidents, fetchReviews, fetchFraud, fetchReports, fetchChats, fetchChatDetails, deleteChat }

