# SPEC-05: Módulo de Sobrescrita de Avaliações pelo Professor

## Objetivo
Permitir que o Professor ajuste ou altere a nota de qualquer aluno integrante, exigindo uma justificativa/esclarecimento por escrito.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/SobrescritaAvaliacao.jsx`
- **Funcionalidades**:
  - Filtro por Turma e Grupo.
  - Exibição dos critérios e notas atuais dos integrantes.
  - Campo obrigatório de texto: `comentario_esclarecimento`.
  - Botão de confirmação de sobrescrita com validação do comentário.
  - Indicador visual `✏️ Alterado pelo Professor` quando a nota foi sobrescrita.

## Mapeamento de Endpoints do Back-End
- `PUT /api/grupos/:grupoId/avaliacoes/:integranteId`: (Executado com token do Professor).
  - Exige payload com `comentario_esclarecimento` preenchido.
  - Define automaticamente `alterado_por_professor = true`.
  - Registra a ação de atualização no `audit_logs`.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/avaliacao.service.test.js` (Aprovado com Vitest).
