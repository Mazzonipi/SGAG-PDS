import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../theme/ThemeProvider.jsx';
import Button from './Button.jsx';

/**
 * Botão de alternância entre tema claro e escuro.
 * Exibe o ícone do tema oposto (ação futura) com rótulo acessível.
 *
 * @returns {JSX.Element} Botão de alternância de tema.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const escuro = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      aria-label={escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
    >
      {escuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
