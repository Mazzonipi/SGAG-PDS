import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import DetalheGrupo from './DetalheGrupo.jsx';

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => ({
    session: { token: 'token-teste', user: { role: 'professor', nome: 'Prof' } },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const GRUPO = {
  id: 'g1',
  turma_id: 't1',
  nome: 'Grupo IA',
  lider: { id: 'l1', nome: 'Ana Lider', email: 'ana@gmail.com' },
  vice: { id: 'v1', nome: 'Bia Vice', email: 'bia@gmail.com' },
  media_geral: null,
  integrantes: [{ id: 'i1', nome_aluno: 'Carlos', avaliacao: null }],
};

function mockFetch() {
  global.fetch = vi.fn((url, opts) => {
    const method = (opts?.method || 'GET').toUpperCase();
    if (method === 'GET' && url.includes(`/grupos/${GRUPO.id}`)) {
      return Promise.resolve({ ok: true, json: async () => ({ grupo: GRUPO }) });
    }
    if (method === 'GET' && url.includes('/grupos')) {
      return Promise.resolve({ ok: true, json: async () => ({ grupo: GRUPO }) });
    }
    if (method === 'PUT' && url.includes('/avaliacoes')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({}) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={[`/grupos/${GRUPO.id}`]}>
      <Routes>
        <Route path="/grupos/:grupoId" element={<DetalheGrupo />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Página de detalhe do grupo (Professor)', () => {
  it('mostra grupo, lider, vice e integrantes', async () => {
    mockFetch();

    renderizar();

    expect(await screen.findByRole('heading', { name: /grupo ia/i })).toBeInTheDocument();
    expect(screen.getByText('Ana Lider')).toBeInTheDocument();
    expect(screen.getByText('Bia Vice')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('edita a avaliacao e exige a justificativa antes de salvar', async () => {
    mockFetch();

    renderizar();
    await screen.findByRole('heading', { name: /grupo ia/i });

    fireEvent.click(screen.getByRole('button', { name: /^avaliar$/i }));

    const salvar = screen.getByRole('button', { name: /salvar e confirmar/i });
    expect(salvar).toBeDisabled();

    const inputs = screen.getAllByRole('spinbutton');
    for (let i = 0; i < inputs.length; i++) {
      fireEvent.change(inputs[i], { target: { value: '0.2' } });
    }
    expect(salvar).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/explique por que/i), {
      target: { value: 'Reavaliacao da banca com novos criterios' },
    });
    expect(salvar).toBeEnabled();

    fireEvent.click(salvar);

    await waitFor(() => {
      const chamada = global.fetch.mock.calls.find(([url, opts]) => opts?.method === 'PUT' && url.includes('/avaliacoes'));
      expect(chamada).toBeDefined();
      const corpo = JSON.parse(chamada[1].body);
      expect(corpo.comentario_esclarecimento).toContain('Reavaliacao');
      expect(corpo.interesse).toBe(0.2);
      expect(corpo.respeito_grupo).toBe(0.2);
    });
  });
});
