import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { login, obterPerfil, registrarUsuario } from '../services/auth.service.js';
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

describe('authService.login (erros especificos)', () => {
  it('autentica com credenciais validas e retorna sessao + perfil ativo', async () => {
    const supabase = holder.supabase;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'prof-1' }, session: { access_token: 'jwt-token' } },
      error: null,
    });
    supabase.queue('profiles', { data: { id: 'prof-1', email: 'prof@escola.com' }, error: null });
    supabase.queue('profiles', { data: PERFIL_PROFESSOR, error: null });

    const resultado = await login({ email: 'prof@escola.com', senha: 'senha123' });

    expect(resultado.session.access_token).toBe('jwt-token');
    expect(resultado.user.role).toBe('professor');
  });

  it('informa e-mail nao cadastrado com HTTP 401', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: null, error: null });

    await expect(login({ email: 'nada@escola.com', senha: 'senha123' })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Nenhuma conta encontrada com esse e-mail.',
    });
  });

  it('informa senha incorreta quando o e-mail existe e a senha erra', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: { id: 'prof-1', email: 'prof@escola.com' }, error: null });
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    await expect(login({ email: 'prof@escola.com', senha: 'errada123' })).rejects.toMatchObject({
      statusCode: 401,
      message: 'Senha incorreta. Verifique e tente novamente.',
    });
  });

  it('rejeita perfil desativado com HTTP 403', async () => {
    const supabase = holder.supabase;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'inativo' }, session: { access_token: 'jwt' } },
      error: null,
    });
    supabase.queue('profiles', { data: { id: 'inativo', email: 'inativo@escola.com' }, error: null });
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

    expect(await obterPerfil('prof-1')).toEqual(PERFIL_PROFESSOR);
  });

  it('lanca AppError 404 quando o perfil nao existe', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: null, error: null });

    await expect(obterPerfil('inexistente')).rejects.toBeInstanceOf(AppError);
  });
});

describe('authService.registrarUsuario', () => {
  const base = { nome: 'Professor CEMI', email: 'professor@gmail.com', senha: 'Senha123' };

  it('cadastra o primeiro professor com sucesso (trigger cria o perfil)', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: [], error: null, count: 0 });
    supabase.auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'prof-1' } }, error: null });
    supabase.queue('profiles', {
      data: { id: 'prof-1', nome: base.nome, email: base.email, role: 'professor', is_active: true },
      error: null,
    });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await registrarUsuario({ ...base, role: 'professor' });

    expect(supabase.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ user_metadata: { role: 'professor', nome: base.nome } })
    );
    expect(resultado).toMatchObject({ id: 'prof-1', role: 'professor' });
  });

  it('rejeita o segundo professor com HTTP 409', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: [], error: null, count: 1 });

    await expect(registrarUsuario({ ...base, role: 'professor' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ja existe um professor cadastrado no sistema',
    });
  });

  it('cadastra um lider com sucesso', async () => {
    const supabase = holder.supabase;

    supabase.auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'lider-1' } }, error: null });
    supabase.queue('profiles', {
      data: { id: 'lider-1', nome: 'Aluno Lider', email: 'lider@gmail.com', role: 'lider', is_active: true },
      error: null,
    });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await registrarUsuario({ ...base, nome: 'Aluno Lider', email: 'lider@gmail.com', role: 'lider' });

    expect(resultado).toMatchObject({ id: 'lider-1', role: 'lider' });
  });

  it('cadastra um vice-lider com sucesso', async () => {
    const supabase = holder.supabase;

    supabase.auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'vice-1' } }, error: null });
    supabase.queue('profiles', {
      data: { id: 'vice-1', nome: 'Aluno Vice', email: 'vice@gmail.com', role: 'vice_lider', is_active: true },
      error: null,
    });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await registrarUsuario({ ...base, nome: 'Aluno Vice', email: 'vice@gmail.com', role: 'vice_lider' });

    expect(resultado.role).toBe('vice_lider');
  });

  it('informa e-mail ja cadastrado com HTTP 400', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', { data: [], error: null, count: 0 });
    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    await expect(registrarUsuario({ ...base, role: 'professor' })).rejects.toMatchObject({
      statusCode: 400,
      message: 'Este e-mail ja esta cadastrado.',
    });
  });
});
