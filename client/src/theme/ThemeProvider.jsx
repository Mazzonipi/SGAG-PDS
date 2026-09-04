import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/** Chave usada no localStorage para persistir a preferência de tema. */
const THEME_KEY = 'sgag-theme';

/**
 * Contexto de tema da aplicação (claro/escuro).
 *
 * @type {React.Context<{theme: string, toggleTheme: Function}>}
 */
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

/**
 * Obtém o tema inicial: preferência salva, preferência do sistema ou 'light'.
 *
 * @returns {'light'|'dark'} Tema inicial.
 */
function obterTemaInicial() {
  if (typeof window === 'undefined') return 'light';
  const salvo = window.localStorage.getItem(THEME_KEY);
  if (salvo === 'dark' || salvo === 'light') return salvo;
  const prefereEscuro = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  return prefereEscuro ? 'dark' : 'light';
}

/**
 * Provedor de tema. Aplica o atributo data-theme no <html> e persiste a escolha.
 *
 * @param {Object} props Propriedades do provedor.
 * @param {React.ReactNode} props.children Conteúdo da aplicação.
 * @returns {JSX.Element} Provedor de tema.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(obterTemaInicial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* armazenamento indisponível */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((atual) => (atual === 'dark' ? 'light' : 'dark'));
  }, []);

  const valor = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

/**
 * Hook de acesso ao tema atual e à função de alternância.
 *
 * @returns {{theme: string, toggleTheme: Function}} Tema e alternância.
 */
export function useTheme() {
  return useContext(ThemeContext);
}
