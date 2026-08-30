import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('deve renderizar a tela de login inicialmente quando nao autenticado', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Acesso ao SGAG-PDS/i })
    ).toBeInTheDocument();
  });

  it('deve exibir o subtitulo do sistema de gestao e avaliacao de grupos', () => {
    render(<App />);

    expect(screen.getByText(/Sistema de Gestão e Avaliação de Grupos/i)).toBeInTheDocument();
  });
});
