import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button.jsx';

describe('Button (UI Soft Dashboard)', () => {
  it('renderiza com a variante primaria e o texto informado', () => {
    render(<Button variant="primary">Entrar</Button>);

    const botao = screen.getByRole('button', { name: 'Entrar' });
    expect(botao).toBeInTheDocument();
  });

  it('chama onClick quando clicado', () => {
    const aoClicar = vi.fn();
    render(<Button onClick={aoClicar}>Salvar</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(aoClicar).toHaveBeenCalledTimes(1);
  });

  it('respeita o estado disabled e nao chama onClick', () => {
    const aoClicar = vi.fn();
    render(
      <Button onClick={aoClicar} disabled>
        Salvar
      </Button>
    );

    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect(botao).toBeDisabled();

    fireEvent.click(botao);
    expect(aoClicar).not.toHaveBeenCalled();
  });

  it('aplica a variante outline com classes de borda', () => {
    const { container } = render(<Button variant="outline">Voltar</Button>);

    expect(container.firstChild.className).toContain('border');
    expect(container.firstChild.className).toContain('bg-surface');
  });
});
