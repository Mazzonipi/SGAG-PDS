import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import { criarPerfil, listarPerfis } from '../services/profile.service.js';

const holder = vi.hoisted(() => ({ supabase: null }));

vi.mock('../config/supabase.js', () => ({
  get supabaseAdmin() {
    return holder.supabase;
  },
}));

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('profileService.criarPerfil', () => {
  it('cria perfil de lider com sucesso e registra auditoria', async () => {
    const supabase = holder.supabase;

    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: { id: 'lider-1' } },
      error: null,
    });
    supabase.queue('profiles', { data: null, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await criarPerfil(
      { nome: 'Aluno Lider', email: 'lider@escola.com', senha: 'senha123', role: 'lider' },
      'prof-1'
    );

    expect(resultado).toMatchObject({ id: 'lider-1', role: 'lider' });
    expect(supabase.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'lider@escola.com',
      password: 'senha123',
      email_confirm: true,
    });
    expect(supabase.from('audit_logs')).toBeDefined();
  });

  it('BLOQUEIA a criacao de um segundo professor com HTTP 400', async () => {
    await expect(
      criarPerfil(
        { nome: 'Outro Prof', email: 'prof2@escola.com', senha: 'senha123', role: 'professor' },
        'prof-1'
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Nao e permitido criar um segundo professor',
    });
  });

  it('BLOQUEIA o cadastro de aluno comum (sem conta) com HTTP 400', async () => {
    await expect(
      criarPerfil(
        { nome: 'Aluno Comum', email: 'aluno@escola.com', senha: 'senha123', role: 'aluno' },
        'prof-1'
      )
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'Alunos comuns nao possuem conta de acesso no sistema',
    });
  });

  it('propaga falha de criacao no Supabase Auth com HTTP 400', async () => {
    const supabase = holder.supabase;

    supabase.auth.admin.createUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'email ja cadastrado' },
    });

    await expect(
      criarPerfil(
        { nome: 'Vice', email: 'vice@escola.com', senha: 'senha123', role: 'vice_lider' },
        'prof-1'
      )
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('profileService.listarPerfis', () => {
  it('lista perfis de lider e vice_lider', async () => {
    const supabase = holder.supabase;

    supabase.queue('profiles', {
      data: [
        { id: 'l1', nome: 'Ana', role: 'lider' },
        { id: 'v1', nome: 'Bia', role: 'vice_lider' },
      ],
      error: null,
    });

    const perfis = await listarPerfis();

    expect(perfis).toHaveLength(2);
    expect(supabase.from('profiles')).toBeDefined();
  });
});
