# SPEC-04: Módulo de Matriz de Avaliação (Líder / Vice-Líder)

## Objetivo
Permitir que o Líder ou Vice-Líder avaliem os integrantes do grupo em 5 critérios de desempenho, aplicando a trava de submissão prioritária do Líder.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/MatrizAvaliacao.jsx`
- **Funcionalidades**:
  - Exibição dos integrantes do grupo e seletores para os 5 critérios:
    - *Pontualidade*, *Qualidade do Trabalho*, *Respeito ao Grupo*, *Comunicação* e *Iniciativa*.
    - Escala de notas: `0.00`, `0.05`, `0.10`, `0.15`, `0.20` (Nota máxima: 1.00).
  - Cálculo automático da nota total acumulada.
  - **Trava de Submissão**: Se o Líder já tiver submetido a avaliação, o Vice-Líder visualiza um aviso de modo **Somente Leitura** (`Lock icon`).

## Mapeamento de Endpoints do Back-End
- `GET /api/grupos/:grupoId/avaliacoes`: Retorna a matriz de avaliação do grupo.
- `PUT /api/grupos/:grupoId/avaliacoes/:integranteId`: Salva as notas do integrante.
  - Se a chamada for feita pelo Vice-Líder e o Líder já tiver submetido, o servidor retorna HTTP 403.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/avaliacao.service.test.js` (Aprovado com Vitest).
