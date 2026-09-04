/**
 * URL base da API. Em desenvolvimento aponta para o back-end local.
 * Defina VITE_API_URL no .env para trocar.
 *
 * @type {string}
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Cliente HTTP para a API do back-end (Express).
 * Injeta o token Bearer da sessão Supabase quando informado.
 *
 * @param {string} caminho Rota da API (ex.: '/auth/login').
 * @param {Object} [opcoes] Opções da requisição.
 * @param {string} [opcoes.method] Método HTTP (GET, POST, PUT, DELETE).
 * @param {Object} [opcoes.body] Corpo da requisição (JSON).
 * @param {string} [opcoes.token] Token de acesso (Bearer).
 * @returns {Promise<Object>} Corpo JSON da resposta.
 * @throws {Error} Lança erro com a mensagem retornada pela API.
 */
export async function api(caminho, { method = 'GET', body, token } = {}) {
  const resposta = await fetch(`${API_URL}/api${caminho}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(
      dados.issues?.[0]?.message || dados.error || 'Erro na requisicao'
    );
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}
