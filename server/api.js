const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/uploads`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed (${res.status})`);
  }

  return res.json();
}

export const api = {
  uploadImage,

  getContainers: () => request('/containers'),
  getContainer: (id) => request(`/containers/${id}`),
  createContainer: (payload) =>
    request('/containers', { method: 'POST', body: JSON.stringify(payload) }),
  updateContainer: (id, payload) =>
    request(`/containers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteContainer: (id) => request(`/containers/${id}`, { method: 'DELETE' }),

  getItems: (favoritedOnly = false) =>
    request(`/items${favoritedOnly ? '?favorited=true' : ''}`),
  getItem: (id) => request(`/items/${id}`),
  createItem: (payload) =>
    request('/items', { method: 'POST', body: JSON.stringify(payload) }),
  updateItem: (id, payload) =>
    request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id, is_favorited) =>
    request(`/items/${id}/favorite`, {
      method: 'PATCH',
      body: JSON.stringify({ is_favorited }),
    }),
};