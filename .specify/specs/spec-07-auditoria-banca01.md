# SPEC-07: Módulo de Trilha Imutável de Auditoria (BANCA-01)

## Objetivo
Manter um histórico inalterável de todas as operações administrativas e avaliações realizadas no sistema para garantir auditoria e governança.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/AuditLogs.jsx`
- **Funcionalidades**:
  - Tabela com histórico em ordem cronológica decrescente.
  - Colunas: Data/Hora formatada em PT-BR, Ação (`INSERT`, `UPDATE`, `DELETE`), Tabela Afetada, ID do Registro, Usuário Executor e Detalhes JSON.
  - Badges coloridas por tipo de ação.

## Mapeamento de Endpoints do Back-End
- `GET /api/audit-logs`: (Exclusivo Professor - RBAC `requireRoles('professor')`).
  - Retorna a lista dos logs gravados na tabela `audit_logs`.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/audit.service.test.js` (Aprovado com Vitest).
