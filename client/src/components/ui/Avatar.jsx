import { cn } from '../../lib/cn.js';

/**
 * Avatar circular com as iniciais do nome.
 * Fundo pastel suave — identificação amigável dos integrantes.
 *
 * @param {Object} props Propriedades do avatar.
 * @param {string} props.name Nome usado para gerar as iniciais.
 * @param {string} [props.className] Classes extras.
 * @returns {JSX.Element} Elemento avatar.
 */
export default function Avatar({ name = '', className = '' }) {
  const iniciais = name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary',
        className
      )}
    >
      {iniciais || '?'}
    </div>
  );
}
