import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { requireAuth, requireRoles } from '../middlewares/auth.middleware.js';
import { AppError } from '../middlewares/error.middleware.js';

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

/** Cria os stubs de req/res/next para testar middlewares. */
function criarContexto(overrides = {}) {
  const req = { headers: {}, user: null, ...overrides };
  const res = {};
  const next = vi.fn();
  return { req, res, next };
}

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('authMiddleware.requireAuth', () => {
  it('autentica com token valido e carrega o perfil em req.user', async () => {
    const supabase = holder.supabase;
    const { req, res, next } = criarContexto({ headers: { authorization: 'Bearer jwt-valido' } });

    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'prof-1' } }, error: null });
    supabase.queue('profiles', { data: PERFIL_PROFESSOR, error: null });

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toMatchObject({ id: 'prof-1', role: 'professor' });
  });

  it('rejeita requisicao sem token com HTTP 401', async () => {
    const { req, res, next } = criarContexto();

    await requireAuth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('rejeita token invalido/expirado com HTTP 401', async () => {
    const supabase = holder.supabase;
    const { req, res, next } = criarContexto({ headers: { authorization: 'Bearer invalido' } });

    supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'JWT expired' } });

    await requireAuth(req, res, next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('rejeita perfil desativado com HTTP 401', async () => {
    const supabase = holder.supabase;
    const { req, res, next } = criarContexto({ headers: { authorization: 'Bearer jwt' } });

    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'inativo' } }, error: null });
    supabase.queue('profiles', { data: { ...PERFIL_PROFESSOR, id: 'inativo', is_active: false }, error: null });

    await requireAuth(req, res, next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it('rejeita usuario sem perfil cadastrado com HTTP 401', async () => {
    const supabase = holder.supabase;
    const { req, res, next } = criarContexto({ headers: { authorization: 'Bearer jwt' } });

    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'sem-perfil' } }, error: null });
    supabase.queue('profiles', { data: null, error: null });

    await requireAuth(req, res, next);

    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });
});

describe('authMiddleware.requireRoles', () => {
  it('permite acesso quando o papel esta entre os permitidos', () => {
    const { req, res, next } = criarContexto({ user: { role: 'professor' } });

    requireRoles('professor', 'lider')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('bloqueia com HTTP 403 quando o papel nao esta permitido', () => {
    const { req, res, next } = criarContexto({ user: { role: 'lider' } });

    requireRoles('professor')(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});
