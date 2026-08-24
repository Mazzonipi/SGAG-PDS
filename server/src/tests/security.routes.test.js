import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import app from '../app.js';

const holder = vi.hoisted(() => ({ supabase: null }));

vi.mock('../config/supabase.js', () => ({
  get supabaseAdmin() {
    return holder.supabase;
  },
}));

const PERFIL_PROFESSOR = {
  id: 'prof-1',
  nome: 'Professor',
  email: 'prof@escola.com',
  role: 'professor',
  is_active: true,
};

/** Configura a autenticação mockada para um perfil específico. */
function autenticarComo(supabase, perfil) {
  supabase.auth.getUser.mockResolvedValue({ data: { user: { id: perfil.id } }, error: null });
  supabase.queue('profiles', { data: perfil, error: null });
  return `Bearer token-${perfil.id}`;
}

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('Seguranca das rotas /api (integracao)', () => {
  it('GET /health permanece publico e operacional', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('BLOQUEIA cadastro de aluno comum via API com HTTP 400', async () => {
    const supabase = holder.supabase;
    const token = autenticarComo(supabase, PERFIL_PROFESSOR);

    const res = await request(app)
      .post('/api/profiles')
      .set('Authorization', token)
      .send({ nome: 'Aluno Comum', email: 'aluno@escola.com', senha: 'senha123', role: 'aluno' });

    expect(res.status).toBe(400);
  });

  it('BLOQUEIA criacao de segundo professor via API com HTTP 400', async () => {
    const supabase = holder.supabase;
    const token = autenticarComo(supabase, PERFIL_PROFESSOR);

    const res = await request(app)
      .post('/api/profiles')
      .set('Authorization', token)
      .send({ nome: 'Outro Prof', email: 'prof2@escola.com', senha: 'senha123', role: 'professor' });

    expect(res.status).toBe(400);
  });

  it('BLOQUEIA acesso sem token com HTTP 401', async () => {
    const res = await request(app).post('/api/profiles').send({});

    expect(res.status).toBe(401);
  });

  it('BLOQUEIA acesso de lider a rota exclusiva de professor com HTTP 403', async () => {
    const supabase = holder.supabase;
    const token = autenticarComo(supabase, {
      id: 'lider-1',
      nome: 'Lider',
      email: 'lider@escola.com',
      role: 'lider',
      is_active: true,
    });

    const res = await request(app).get('/api/audit-logs').set('Authorization', token);

    expect(res.status).toBe(403);
  });

  it('permite o professor acessar o historico de auditoria', async () => {
    const supabase = holder.supabase;
    const token = autenticarComo(supabase, PERFIL_PROFESSOR);
    supabase.queue('audit_logs', { data: [], error: null });

    const res = await request(app).get('/api/audit-logs').set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body.logs).toEqual([]);
  });

  it('responde 401 com credenciais invalidas no login', async () => {
    const supabase = holder.supabase;
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'x@escola.com', senha: 'errada123' });

    expect(res.status).toBe(401);
  });
});
