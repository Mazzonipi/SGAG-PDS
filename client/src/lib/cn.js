/**
 * Junta strings de classes CSS, ignorando valores falsos.
 * Utilidade leve (substituta de clsx/tailwind-merge) para o design system.
 *
 * @param {...(string|false|null|undefined)} partes Classes CSS.
 * @returns {string} Classes concatenadas.
 */
export function cn(...partes) {
  return partes.filter(Boolean).join(' ');
}
