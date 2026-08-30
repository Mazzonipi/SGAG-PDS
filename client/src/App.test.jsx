import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('deve renderizar o titulo principal da aplicacao', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /SGAG-PDS/i })
    ).toBeInTheDocument();
  });

  it('deve exibir a mensagem de ambiente base configurado', () => {
    render(<App />);

    expect(screen.getByText(/Ambiente base configurado/i)).toBeInTheDocument();
  });
});
