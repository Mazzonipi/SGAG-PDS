import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { obterMetricasDashboard } from '../services/dashboard.service.js';

const holder = vi.hoisted(() => ({ supabase: null }));

vi.mock('../config/supabase.js', () => ({
  get supabaseAdmin() {
    return holder.supabase;
  },
}));

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('dashboardService.obterMetricasDashboard', () => {
  it('retorna metricas globais de turmas, grupos e avaliacoes', async () => {
    const supabase = holder.supabase;

    supabase.queue('turmas', { data: [], error: null, count: 4 });
    supabase.queue('grupos', { data: [], error: null, count: 5 });
    supabase.queue('integrantes', { data: [], error: null, count: 20 });
    supabase.queue('avaliacoes', { data: [], error: null, count: 15 });

    const metricas = await obterMetricasDashboard({});

    expect(metricas.total_turmas).toBe(4);
    expect(metricas.total_grupos).toBe(5);
    expect(metricas.avaliacoes.concluidas).toBe(15);
    expect(metricas.avaliacoes.pendentes).toBe(5);
  });

  it('filtra metricas por turma', async () => {
    const supabase = holder.supabase;

    supabase.queue('turmas', { data: [], error: null, count: 4 });
    supabase.queue('grupos', { data: [], error: null, count: 2 });
    supabase.queue('grupos', { data: [{ id: 'g1' }, { id: 'g2' }], error: null });
    supabase.queue('integrantes', { data: [], error: null, count: 10 });
    supabase.queue('avaliacoes', { data: [], error: null, count: 4 });

    const metricas = await obterMetricasDashboard({ turmaId: 'turma-3a' });

    expect(metricas.total_grupos).toBe(2);
    expect(metricas.avaliacoes.concluidas).toBe(4);
    expect(metricas.avaliacoes.pendentes).toBe(6);
  });
});
