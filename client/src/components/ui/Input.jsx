import { cn } from '../../lib/cn.js';

/**
 * Campo de texto do design system Soft Dashboard.
 * Input grande, rótulo claro, ícone opcional e foco em azul profundo.
 *
 * @param {Object} props Propriedades do campo.
 * @param {string} [props.label] Rótulo do campo.
 * @param {React.ComponentType<{className: string}>} [props.icon] Ícone à esquerda.
 * @param {string} [props.helper] Texto de ajuda.
 * @param {string} [props.error] Mensagem de erro.
 * @param {string} [props.className] Classes extras.
 * @param {boolean} [props.disabled] Desabilita o campo.
 * @returns {JSX.Element} Elemento campo.
 */
export default function Input({ label, icon: Icon, helper, error, className = '', ...props }) {
  return (
    <label className="block text-left">
      {label && <span className="mb-1.5 block text-sm font-semibold text-text">{label}</span>}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        )}
        <input
          className={cn(
            'h-12 w-full rounded-xl border border-border bg-surface px-3.5 text-base text-text',
            'placeholder:text-text-muted transition-all duration-150',
            'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15',
            Icon && 'pl-11',
            error && 'border-danger focus:border-danger focus:ring-danger/15',
            className
          )}
          {...props}
        />
      </div>
      {helper && !error && <span className="mt-1 block text-sm text-text-muted">{helper}</span>}
      {error && <span className="mt-1 block text-sm font-medium text-danger">{error}</span>}
    </label>
  );
}
