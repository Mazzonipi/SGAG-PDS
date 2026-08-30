# SPEC-06: Módulo de Dashboard e Métricas (BANCA-02)

## Objetivo
Fornecer um painel visual consolidado das métricas de turmas, grupos e status de avaliações em tempo real.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/DashboardMetrics.jsx`
- **Funcionalidades**:
  - Cards estatísticos: Total de Turmas, Total de Grupos, Avaliações Concluídas e Avaliações Pendentes.
  - Barra de progresso percentual da conclusão das avaliações.
  - Filtro interativo por turma específica ou visão consolidada.

## Mapeamento de Endpoints do Back-End
- `GET /api/dashboard`: Retorna métricas globais `{ total_turmas, total_grupos, avaliacoes: { concluidas, pendentes } }`.
- `GET /api/dashboard?turmaId=<UUID>`: Retorna as métricas filtradas pela turma informada.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/dashboard.service.test.js` (Aprovado com Vitest).
