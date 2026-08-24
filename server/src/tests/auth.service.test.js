import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { login, obterPerfil } from '../services/auth.service.js';
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

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('authService.login', () => {
  it('autentica com credenciais validas e retorna sessao + perfil ativo', async () => {
    const supabase = holder.supabase;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'prof-1' }, session: { access_token: 'jwt-token' } },
      error: null,
    });
    supabase.queue('profiles', { data: PERFIL_PROFESSOR, error: null });

    const resultado = await login({ email: 'prof@escola.com', senha: 'senha123' });

    expect(resultado.session.access_token).toBe('jwt-token');
    expect(resultado.user.role).toBe('professor');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'prof@escola.com',
      password: 'senha123',
    });
  });

  it('rejeita credenciais invalidas com HTTP 401', async () => {
    const supabase = holder.supabase;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(login({ email: 'x@escola.com', senha: 'errada123' })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Credenciais invalidas',
    });
  });

  it('rejeita usuario autenticado sem perfil autorizado com HTTP 401', async () => {
    const supabase = holder.supabase;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'sem-perfil' }, session: { access_token: 'jwt' } },
      error: null,
    });
    supabase.queue('profiles', { data: null, error: null });

    await expect(login({ email: 'sem@escola.com', senha: 'senha123' })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Usuario sem perfil autorizado no sistema',
    });
  });

  it('rejeita perfil desativado com HTTP 403', async () => {
    const supabase = holder.supabase;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'inativo' }, session: { access_token: 'jwt' } },
      error: null,
    });
    supabase.queue('profiles', { data: { ...PERFIL_PROFESSOR, id: 'inativo', is_active: false }, error: null });

    await expect(login({ email: 'inativo@escola.com', senha: 'senha123' })).rejects.toMatchObject({
      statusCode: 403,
      message: 'Perfil desativado',
    });
  });
});

describe('authService.obterPerfil', () => {
  it('retorna o perfil do usuario autenticado', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: PERFIL_PROFESSOR, error: null });

    const perfil = await obterPerfil('prof-1');

    expect(perfil).toEqual(PERFIL_PROFESSOR);
  });

  it('lanca AppError 404 quando o perfil nao existe', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: null, error: null });

    await expect(obterPerfil('inexistente')).rejects.toBeInstanceOf(AppError);
  });
});
