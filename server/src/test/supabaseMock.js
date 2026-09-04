import { vi } from 'vitest';

/**
 * Cria um mock encadeável do cliente Supabase para testes de unidade/integração.
 *
 * Orquestração: use `supabase.queue(tabela, resultado)` para enfileirar o
 * resultado (objeto `{ data, error, count }`) de cada consulta à tabela.
 * Cada chamada a `from(tabela)` consome o próximo resultado enfileirado da
 * tabela; se não houver, resolve para `{ data: null, error: null }`.
 *
 * - `client.auth.getUser`, `client.auth.signInWithPassword` e
 *   `client.auth.admin.createUser` são vi.fn configuráveis.
 *
 * @returns {Object} Cliente Supabase mockado com suporte a `queue`.
 */
export function createSupabaseMock() {
  /** @type {Map<string, Array<{data: *, error: *, count?: number}>>} */
  const fila = new Map();

  const auth = {
    getUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    signInWithPassword: vi.fn(async () => ({ data: { session: null, user: null }, error: null })),
    admin: {
      createUser: vi.fn(async () => ({ data: { user: null }, error: null })),
    },
  };

  /**
   * Enfileira o próximo resultado para uma tabela.
   *
   * @param {string} tabela Nome da tabela.
   * @param {{data: *, error: *, count?: number}} resultado Resultado da query.
   * @returns {Object} Cliente mockado (encadeável).
   */
  const queue = (tabela, resultado) => {
    if (!fila.has(tabela)) fila.set(tabela, []);
    fila.get(tabela).push(resultado);
    return supabaseClient;
  };

  /**
   * Consome o próximo resultado enfileirado da tabela.
   *
   * @param {string} tabela Nome da tabela.
   * @returns {Promise<{data: *, error: *, count?: number}>} Resultado da query.
   */
  const consumir = async (tabela) => {
    const lista = fila.get(tabela) || [];
    if (lista.length === 0) return { data: null, error: null, count: null };
    return lista.shift();
  };

  /**
   * Cria uma chain encadeável (thenable) para uma consulta.
   *
   * @param {string} tabela Nome da tabela.
   * @returns {Object} Chain mockada.
   */
  const createChain = (tabela) => {
    const chain = { tabela };

    [
      'select',
      'insert',
      'update',
      'delete',
      'upsert',
      'eq',
      'neq',
      'in',
      'or',
      'ilike',
      'order',
      'limit',
      'range',
      'gte',
      'lte',
    ].forEach((metodo) => {
      chain[metodo] = vi.fn(() => chain);
    });

    const resolver = () => consumir(tabela);

    ['single', 'maybeSingle'].forEach((metodo) => {
      chain[metodo] = vi.fn(() => resolver());
    });

    chain.then = (onFulfilled, onRejected) => resolver().then(onFulfilled, onRejected);
    chain.catch = (onRejected) => resolver().catch(onRejected);
    chain.finally = (onFinally) => resolver().finally(onFinally);

    return chain;
  };

  const from = vi.fn((tabela) => createChain(tabela));

  const supabaseClient = { from, auth, queue };

  return supabaseClient;
}
