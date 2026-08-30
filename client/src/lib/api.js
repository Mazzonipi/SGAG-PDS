const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Utilitário centralizado para fazer requisições à API do SGAG-PDS.
 *
 * @param {string} endpoint - Caminho relativo do endpoint (ex: '/auth/login').
 * @param {Object} [options={}] - Opções do fetch (method, headers, body, etc.).
 * @returns {Promise<any>} Dados de resposta JSON.
 */
export async function apiFetch(endpoint, options = {}) {
  let token = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      token = window.localStorage.getItem('sgag_token');
    }
  } catch (e) {
    // Ignore storage errors
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || 'Ocorreu um erro na requisição';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
