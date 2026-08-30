import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { listarAuditLogs } from '../services/audit.service.js';

const holder = vi.hoisted(() => ({ supabase: null }));

vi.mock('../config/supabase.js', () => ({
  get supabaseAdmin() {
    return holder.supabase;
  },
}));

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('auditService.listarAuditLogs', () => {
  it('retorna o historico de alteracoes ordenado', async () => {
    const supabase = holder.supabase;

    supabase.queue('audit_logs', {
      data: [
        { id: 'log-1', tabela_afetada: 'avaliacoes', acao: 'OVERRIDE_NOTA', detalhes: {} },
        { id: 'log-2', tabela_afetada: 'grupos', acao: 'INSERT', detalhes: {} },
      ],
      error: null,
    });

    const logs = await listarAuditLogs();

    expect(logs).toHaveLength(2);
    expect(logs[0].tabela_afetada).toBe('avaliacoes');
  });
});
