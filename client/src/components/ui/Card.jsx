import { cn } from '../../lib/cn.js';

/**
 * Cartão do design system Soft Dashboard.
 * Superfície branca, cantos arredondados, borda discreta e sombra suave.
 *
 * @param {Object} props Propriedades do cartão.
 * @param {React.ReactNode} props.children Conteúdo.
 * @param {string} [props.className] Classes extras.
 * @param {Function} [props.onClick] Callback de clique opcional.
 * @returns {JSX.Element} Elemento cartão.
 */
export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface shadow-sm',
        'transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
