import { z } from 'zod';

/**
 * Valida se um número de critério (0.00 a 0.20) é múltiplo de 0.05,
 * conforme a matriz de avaliação especificada.
 *
 * @param {number} valor Valor do critério.
 * @returns {boolean} true se o valor é múltiplo de 0.05 dentro da tolerância.
 */
const ehMultiploDeCincoCentimos = (valor) => {
  const centavos = Math.round(valor * 100);
  return Math.abs(centavos - valor * 100) < 1e-6 && centavos % 5 === 0;
};

/**
 * Critério de avaliação: valor numérico entre 0.00 e 0.20 com passo 0.05.
 */
const criterioSchema = z
  .number()
  .min(0, 'O criterio nao pode ser negativo')
  .max(0.2, 'O criterio nao pode ultrapassar 0.20')
  .refine(ehMultiploDeCincoCentimos, 'O criterio deve ser multiplo de 0.05');

/**
 * Schema de autenticação (login).
 */
export const loginSchema = z.object({
  email: z.string().email('E-mail invalido'),
  senha: z.string().min(6, 'A senha deve ter no minimo 6 caracteres'),
});

/**
 * Schema de cadastro de perfil (exclusivo do Professor).
 * Apenas lider e vice_lider podem ser cadastrados — segundo professor e
 * aluno comum são bloqueados na camada de validação.
 */
export const criarPerfilSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no minimo 3 caracteres').max(255),
  email: z.string().email('E-mail invalido'),
  senha: z.string().min(6, 'A senha deve ter no minimo 6 caracteres'),
  role: z.enum(['lider', 'vice_lider'], {
    errorMap: () => ({ message: 'Somente os perfis lider e vice_lider podem ser cadastrados pelo professor' }),
  }),
});

/**
 * Schema de listagem de perfis (filtro opcional por papel).
 */
export const listarPerfisSchema = z.object({
  role: z.enum(['lider', 'vice_lider']).optional(),
});

/**
 * Schema de criação de grupo (nome entre 1 e 100 caracteres).
 */
export const criarGrupoSchema = z.object({
  nome: z.string().min(1, 'O nome do grupo e obrigatorio').max(100),
});

/**
 * Schema de renomeação de grupo.
 */
export const renomearGrupoSchema = z.object({
  nome: z.string().min(1, 'O nome do grupo e obrigatorio').max(100),
});

/**
 * Schema de adição de integrante (aluno comum sem conta de acesso).
 */
export const adicionarIntegranteSchema = z.object({
  nome_aluno: z.string().min(1, 'O nome do aluno e obrigatorio').max(255),
});

/**
 * Schema de designação de Líder/Vice-Líder.
 */
export const designarPapelSchema = z.object({
  perfil_id: z.string().uuid('Perfil invalido'),
});

/**
 * Schema de submissão de avaliação individual de um integrante.
 * 5 critérios (0.00 a 0.20, passo 0.05) + comentário opcional.
 */
export const avaliacaoSchema = z.object({
  interesse: criterioSchema,
  entrega_prazo: criterioSchema,
  participacao: criterioSchema,
  qualidade_trabalho: criterioSchema,
  respeito_grupo: criterioSchema,
  comentario_esclarecimento: z.string().max(2000).optional().nullable(),
});

/**
 * Schema de exclusão de avaliação (Professor). Exige justificativa.
 */
export const excluirAvaliacaoSchema = z.object({
  comentario_esclarecimento: z
    .string()
    .min(1, 'O comentario de esclarecimento e obrigatorio para excluir a nota'),
});
