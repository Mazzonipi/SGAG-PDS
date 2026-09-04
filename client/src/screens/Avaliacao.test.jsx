import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Avaliacao from './Avaliacao.jsx';

vi.mock('../auth/AuthContext.jsx', () => ({
  useAuth: () => ({
    session: { token: 'token-teste', user: { role: 'lider', nome: 'Ana Lider' } },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const GRUPO = { id: 'g1', nome: 'Grupo IA', turma_nome: '3A', lider_id: 'l1', vice_lider_id: null };

function mockFetch() {
  global.fetch = vi.fn((url) => {
    if (url.includes('/grupos/me')) {
      return Promise.resolve({ ok: true, json: async () => ({ grupo: GRUPO }) });
    }
    if (url.includes('/avaliacoes')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          integrantes: [
            { id: 'i1', nome_aluno: 'Ana Lider', avaliacao: null },
            { id: 'i2', nome_aluno: 'Carlos', avaliacao: null },
          ],
          permissao: { podeEditar: true, liderSubmeteu: false, motivo: null },
        }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });
}

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('Página de Avaliação (Líder/Vice-Líder)', () => {
  it('mostra o grupo e os integrantes, marcando a autoavaliacao com "(você)"', async () => {
    mockFetch();

    render(<Avaliacao />);

    expect(await screen.findByText('Grupo IA')).toBeInTheDocument();
    const linhaEu = screen.getByText((_texto, el) => el?.tagName === 'P' && el.textContent.includes('(você)'));
    expect(linhaEu.textContent).toContain('Ana Lider');
    expect(screen.getByText('Carlos')).toBeInTheDocument();
    for (const criterio of ['Interesse', 'Entrega no prazo', 'Participação', 'Qualidade no trabalho', 'Respeito no grupo']) {
      expect(screen.getAllByText(criterio).length).toBeGreaterThan(0);
    }
  });

  it('envia a avaliacao com os 5 criterios ao salvar', async () => {
    mockFetch();

    render(<Avaliacao />);
    await screen.findByText('Grupo IA');

    const botoesSalvar = screen.getAllByRole('button', { name: /salvar avaliação/i });
    expect(botoesSalvar).toHaveLength(2);

    const numeroInputs = screen.getAllByRole('spinbutton');
    // Primeiro integrante: todos os critérios = 0.20
    for (let i = 0; i < 5; i++) {
      fireEvent.change(numeroInputs[i], { target: { value: '0.2' } });
    }
    fireEvent.click(botoesSalvar[0]);

    await waitFor(() => {
      const chamada = global.fetch.mock.calls.find(([url, opts]) => opts?.method === 'PUT');
      expect(chamada).toBeDefined();
      expect(chamada[0]).toContain('/grupos/g1/avaliacoes/i1');
      const corpo = JSON.parse(chamada[1].body);
      expect(corpo).toEqual({
        interesse: 0.2,
        entrega_prazo: 0.2,
        participacao: 0.2,
        qualidade_trabalho: 0.2,
        respeito_grupo: 0.2,
      });
    });
  });
});
