import { API_URL } from '../constants'

export function apiFetch(path, options = {}) {
  const token = localStorage.getItem('sdg-token')
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
