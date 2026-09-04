import { X } from 'lucide-react';
import { cn } from '../../lib/cn.js';

/**
 * Modal do design system Soft Dashboard.
 * Fundo com desfoque (backdrop blur), cantos arredondados e botão de fechar.
 *
 * @param {Object} props Propriedades do modal.
 * @param {boolean} props.open Controla a exibição.
 * @param {Function} props.onClose Callback de fechamento.
 * @param {React.ReactNode} [props.title] Título do modal.
 * @param {React.ReactNode} props.children Conteúdo.
 * @param {string} [props.className] Classes extras.
 * @returns {JSX.Element|null} Elemento modal ou null quando fechado.
 */
export default function Modal({ open, onClose, title, children, className = '' }) {
  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={cn('relative w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl', className)}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-text">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Fechar janela"
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
