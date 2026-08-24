import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSupabaseMock } from '../test/supabaseMock.js';
import {
  criarGrupo,
  adicionarIntegrante,
  renomearGrupo,
  excluirGrupo,
  designarLider,
  designarViceLider,
  listarGruposDaTurma,
} from '../services/grupo.service.js';

const holder = vi.hoisted(() => ({ supabase: null }));

vi.mock('../config/supabase.js', () => ({
  get supabaseAdmin() {
    return holder.supabase;
  },
}));

const TURMA = { id: 'turma-3a', nome: '3A' };
const GRUPO = { id: 'g1', turma_id: 'turma-3a', nome: 'Grupo Alfa' };

beforeEach(() => {
  holder.supabase = createSupabaseMock();
});

describe('grupoService.criarGrupo', () => {
  it('cria grupo quando a turma ainda tem vagas (abaixo de 5)', async () => {
    const supabase = holder.supabase;

    supabase.queue('turmas', { data: TURMA, error: null });
    supabase.queue('grupos', { data: [], error: null, count: 2 });
    supabase.queue('grupos', { data: GRUPO, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const grupo = await criarGrupo({ turmaId: 'turma-3a', nome: 'Grupo Alfa', professorId: 'prof-1' });

    expect(grupo).toEqual(GRUPO);
  });

  it('BLOQUEIA a criacao do 6o grupo da turma com HTTP 400', async () => {
    const supabase = holder.supabase;

    supabase.queue('turmas', { data: TURMA, error: null });
    supabase.queue('grupos', { data: [], error: null, count: 5 });

    await expect(
      criarGrupo({ turmaId: 'turma-3a', nome: 'Grupo Extra', professorId: 'prof-1' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'A turma ja atingiu o limite maximo de 5 grupos',
    });
  });

  it('lanca HTTP 404 quando a turma nao existe', async () => {
    const supabase = holder.supabase;

    supabase.queue('turmas', { data: null, error: null });

    await expect(
      criarGrupo({ turmaId: 'inexistente', nome: 'Grupo', professorId: 'prof-1' })
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('grupoService.adicionarIntegrante', () => {
  it('adiciona integrante quando o grupo tem menos de 7 membros', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: GRUPO, error: null });
    supabase.queue('integrantes', { data: [], error: null, count: 3 });
    supabase.queue('integrantes', { data: { id: 'i1', grupo_id: 'g1', nome_aluno: 'Carlos' }, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const integrante = await adicionarIntegrante({
      grupoId: 'g1',
      nomeAluno: 'Carlos',
      professorId: 'prof-1',
    });

    expect(integrante.nome_aluno).toBe('Carlos');
  });

  it('BLOQUEIA a adicao do 8o integrante do grupo com HTTP 400', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: GRUPO, error: null });
    supabase.queue('integrantes', { data: [], error: null, count: 7 });

    await expect(
      adicionarIntegrante({ grupoId: 'g1', nomeAluno: 'Zeca', professorId: 'prof-1' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'O grupo ja atingiu o limite maximo de 7 integrantes',
    });
  });
});

describe('grupoService.renomearGrupo', () => {
  it('renomeia grupo com sucesso', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: GRUPO, error: null });
    supabase.queue('grupos', { data: { ...GRUPO, nome: 'Grupo Beta' }, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const grupo = await renomearGrupo({ grupoId: 'g1', nome: 'Grupo Beta', professorId: 'prof-1' });

    expect(grupo.nome).toBe('Grupo Beta');
  });
});

describe('grupoService.excluirGrupo', () => {
  it('exclui grupo e registra auditoria', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: GRUPO, error: null });
    supabase.queue('grupos', { data: null, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await excluirGrupo({ grupoId: 'g1', professorId: 'prof-1' });

    expect(resultado.success).toBe(true);
  });
});

describe('grupoService.designarLider', () => {
  it('designa lider quando o perfil possui o papel lider', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: { ...GRUPO, lider_id: null, vice_lider_id: null }, error: null });
    supabase.queue('profiles', { data: { id: 'l1', role: 'lider', is_active: true }, error: null });
    supabase.queue('grupos', { data: null, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await designarLider({ grupoId: 'g1', perfilId: 'l1', professorId: 'prof-1' });

    expect(resultado.lider_id).toBe('l1');
  });

  it('BLOQUEIA designacao quando o perfil nao possui papel de lider', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: { ...GRUPO, lider_id: null, vice_lider_id: null }, error: null });
    supabase.queue('profiles', { data: { id: 'v1', role: 'vice_lider', is_active: true }, error: null });

    await expect(designarLider({ grupoId: 'g1', perfilId: 'v1', professorId: 'prof-1' })).rejects.toMatchObject(
      {
        statusCode: 400,
        message: 'O perfil indicado nao possui o papel de lider',
      }
    );
  });
});

describe('grupoService.designarViceLider', () => {
  it('designa vice-lider quando o perfil possui o papel vice_lider', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: { ...GRUPO, lider_id: 'l1', vice_lider_id: null }, error: null });
    supabase.queue('profiles', { data: { id: 'v1', role: 'vice_lider', is_active: true }, error: null });
    supabase.queue('grupos', { data: null, error: null });
    supabase.queue('audit_logs', { data: null, error: null });

    const resultado = await designarViceLider({ grupoId: 'g1', perfilId: 'v1', professorId: 'prof-1' });

    expect(resultado.vice_lider_id).toBe('v1');
  });

  it('BLOQUEIA designacao quando o perfil nao possui papel de vice-lider', async () => {
    const supabase = holder.supabase;

    supabase.queue('grupos', { data: { ...GRUPO, lider_id: null, vice_lider_id: null }, error: null });
    supabase.queue('profiles', { data: { id: 'l1', role: 'lider', is_active: true }, error: null });

    await expect(
      designarViceLider({ grupoId: 'g1', perfilId: 'l1', professorId: 'prof-1' })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: 'O perfil indicado nao possui o papel de vice-lider',
    });
  });
});

describe('grupoService.listarGruposDaTurma', () => {
  it('lista grupos com lider, vice e integrantes', async () => {
    const supabase = holder.supabase;

    supabase.queue('turmas', { data: TURMA, error: null });
    supabase.queue('grupos', {
      data: [
        {
          id: 'g1',
          nome: 'Grupo Alfa',
          lider_id: 'l1',
          vice_lider_id: 'v1',
          lider: { id: 'l1', nome: 'Ana' },
          vice: { id: 'v1', nome: 'Bia' },
          integrantes: [{ id: 'i1', nome_aluno: 'Carlos' }],
        },
      ],
      error: null,
    });

    const grupos = await listarGruposDaTurma('turma-3a');

    expect(grupos).toHaveLength(1);
    expect(grupos[0].lider.nome).toBe('Ana');
  });
});
