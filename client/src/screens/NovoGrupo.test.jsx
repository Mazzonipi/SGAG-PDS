import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NovoGrupo from './NovoGrupo.jsx';

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => ({
    session: { token: 'token-teste', user: { role: 'professor', nome: 'Prof' } },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const LIDER = '11111111-1111-4111-8111-111111111111';
const VICE = '22222222-2222-4222-8222-222222222222';

function mockFetch() {
  global.fetch = vi.fn((url, opts) => {
    const method = (opts?.method || 'GET').toUpperCase();
    const path = url.replace('http://localhost:5000/api', '');

    if (method === 'POST' && path.includes('/grupos/novo')) {
      return Promise.resolve({ ok: true, status: 201, json: async () => ({ grupo: { id: 'g1' } }) });
    }
    if (path.includes('/profiles')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          perfis: [
            { id: LIDER, nome: 'Ana Lider', role: 'lider', is_active: true },
            { id: VICE, nome: 'Bia Vice', role: 'vice_lider', is_active: true },
          ],
        }),
      });
    }
    if (path.endsWith('/turmas')) {
      return Promise.resolve({ ok: true, json: async () => ({ turmas: [{ id: 't1', nome: '3A' }] }) });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/grupos/novo/t1']}>
      <Routes>
        <Route path="/grupos/novo/:turmaId" element={<NovoGrupo />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Página Novo Grupo', () => {
  it('cria um grupo completo com nome, lider, vice e integrantes', async () => {
    mockFetch();

    renderizar();

    // aguarda os selects (combobox) carregarem
    const selects = await screen.findAllByRole('combobox');

    fireEvent.change(screen.getByLabelText('Nome do grupo'), { target: { value: 'Grupo IA' } });
    fireEvent.change(selects[0], { target: { value: LIDER } });
    fireEvent.change(selects[1], { target: { value: VICE } });

    fireEvent.click(screen.getByRole('button', { name: /adicionar integrante/i }));
    fireEvent.change(screen.getByLabelText('Aluno 1'), { target: { value: 'Carlos' } });
    fireEvent.click(screen.getByRole('button', { name: /adicionar integrante/i }));
    fireEvent.change(screen.getByLabelText('Aluno 2'), { target: { value: 'Duda' } });

    fireEvent.click(screen.getByRole('button', { name: /criar grupo/i }));

    await waitFor(() => {
      const chamada = global.fetch.mock.calls.find(
        ([url, opts]) => opts?.method === 'POST' && url.includes('/grupos/novo')
      );
      expect(chamada).toBeDefined();
      const corpo = JSON.parse(chamada[1].body);
      expect(corpo.turma_id).toBe('t1');
      expect(corpo.nome).toBe('Grupo IA');
      expect(corpo.lider_id).toBe(LIDER);
      expect(corpo.vice_lider_id).toBe(VICE);
      expect(corpo.integrantes).toEqual(['Carlos', 'Duda']);
    });
  });
});
