const API_BASE = '';

async function request(path, options = {}) {
  const config = {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(`${API_BASE}${path}`, config);
  if (res.status === 204) return { success: true, data: null };
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const invoiceApi = {
  list: (params = '') => request(`/api/invoices${params}`),
  getById: (id) => request(`/api/invoices/${id}`),
  create: (body) => request('/api/invoices', { method: 'POST', body }),
  update: (id, body) => request(`/api/invoices/${id}`, { method: 'PUT', body }),
  delete: (id) => request(`/api/invoices/${id}`, { method: 'DELETE' }),
};

export const businessProfileApi = {
  get: () => request('/api/businessProfile/me'),
  create: (body) => request('/api/businessProfile', { method: 'POST', body }),
  update: (id, body) => request(`/api/businessProfile/${id}`, { method: 'PUT', body }),
};

export const aiInvoiceApi = {
  generate: (prompt) => request('/api/ai-invoice/generate', { method: 'POST', body: { prompt } }),
};
