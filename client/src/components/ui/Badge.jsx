import { cn } from '../../lib/cn.js';

/**
 * Tonalidades de papel (badges) da identidade visual.
 * Cores pastéis com texto de alto contraste + rótulo textual (acessível).
 *
 * @type {Object<string,string>}
 */
const tons = {
  lider: 'bg-badge-lider-bg text-badge-lider-text',
  vice: 'bg-badge-vice-bg text-badge-vice-text',
  aluno: 'bg-badge-aluno-bg text-badge-aluno-text',
  professor: 'bg-badge-professor-bg text-badge-professor-text',
};

/**
 * Badge de papel do design system Soft Dashboard.
 *
 * @param {Object} props Propriedades da badge.
 * @param {React.ReactNode} props.children Texto/ícone.
 * @param {('lider'|'vice'|'aluno'|'professor')} [props.tone] Tom de papel.
 * @param {string} [props.className] Classes extras.
 * @returns {JSX.Element} Elemento badge.
 */
export default function Badge({ children, tone = 'aluno', className = '', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
        tons[tone] || tons.aluno,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
