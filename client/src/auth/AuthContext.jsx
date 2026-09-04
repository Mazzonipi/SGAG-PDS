import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../services/api.js';

/** Chave usada no localStorage para persistir a sessão. */
const AUTH_KEY = 'sgag-session';

/**
 * Contexto de autenticação da aplicação.
 *
 * @type {React.Context<{session: Object|null, login: Function, logout: Function}>}
 */
const AuthContext = createContext(null);

/**
 * Provedor de autenticação. Gerencia a sessão (token + perfil) e a persistência.
 *
 * @param {Object} props Propriedades do provedor.
 * @param {React.ReactNode} props.children Conteúdo da aplicação.
 * @returns {JSX.Element} Provedor de autenticação.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(AUTH_KEY));
    } catch {
      return null;
    }
  });

  /**
   * Autentica o usuário e persiste a sessão.
   *
   * @param {string} email E-mail do usuário.
   * @param {string} senha Senha do usuário.
   * @returns {Promise<{token: string, user: Object}>} Sessão criada.
   */
  const login = useCallback(async (email, senha) => {
    const dados = await api('/auth/login', { method: 'POST', body: { email, senha } });
    const novaSessao = { token: dados.session.access_token, user: dados.user };
    setSession(novaSessao);
    try {
      window.localStorage.setItem(AUTH_KEY, JSON.stringify(novaSessao));
    } catch {
      /* armazenamento indisponível */
    }
    return novaSessao;
  }, []);

  /**
   * Encerra a sessão local.
   */
  const logout = useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch {
      /* armazenamento indisponível */
    }
  }, []);

  const valor = useMemo(() => ({ session, login, logout }), [session, login, logout]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/**
 * Hook de acesso à autenticação (sessão, login e logout).
 *
 * @returns {{session: Object|null, login: Function, logout: Function}} Dados de autenticação.
 */
export function useAuth() {
  return useContext(AuthContext);
}
