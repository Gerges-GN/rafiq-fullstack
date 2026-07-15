const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

async function getJson(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`Request failed ${res.status}`)
  return res.json()
}

export async function fetchStats() {
  return getJson('/api/admin/stats')
}

export async function fetchChart() {
  return getJson('/api/admin/chart')
}

export async function fetchClassifications() {
  return getJson('/api/admin/classifications')
}

export async function fetchIncidents() {
  return getJson('/api/admin/incidents')
}

export async function fetchReviews(params = {}) {
  const query = new URLSearchParams(params).toString()
  return getJson(`/api/admin/reviews${query ? `?${query}` : ''}`)
}

export async function fetchFraud(params = {}) {
  const query = new URLSearchParams(params).toString()
  return getJson(`/api/admin/fraud${query ? `?${query}` : ''}`)
}

export async function flagReview({ id, reason }) {
  const res = await fetch(`${BASE}/api/admin/fraud/flag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, reason }),
  })
  if (!res.ok) throw new Error('Flag request failed')
  return res.json()
}

export async function unflagReview({ id }) {
  const res = await fetch(`${BASE}/api/admin/fraud/unflag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error('Unflag request failed')
  return res.json()
}

export async function fetchReports() {
  return getJson('/api/admin/reports')
}

export async function fetchChats() {
  return getJson('/api/admin/chats')
}

export async function fetchChatDetails(id) {
  return getJson(`/api/admin/chats/${id}`)
}

export async function deleteChat(id) {
  const res = await fetch(`${BASE}/api/admin/chats/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Delete chat request failed')
  return res.json()
}

export default { fetchStats, fetchChart, fetchClassifications, fetchIncidents, fetchReviews, fetchFraud, fetchReports, fetchChats, fetchChatDetails, deleteChat }

