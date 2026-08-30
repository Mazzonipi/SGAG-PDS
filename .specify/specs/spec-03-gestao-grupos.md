# SPEC-03: Módulo de Gestão de Turmas e Grupos

## Objetivo
Gerenciar as turmas, criação de grupos (máx. 5/turma), inclusão de alunos integrantes (máx. 7/grupo) e a designação dos papéis de Líder e Vice-Líder pelo Professor.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/GestaoGrupos.jsx`
- **Funcionalidades**:
  - Seletor de Turma (3A, 3B, 3C, 3D).
  - Formulário para criação de grupo com aviso visual de limite (5 grupos por turma).
  - Formulário para adição de alunos/integrantes ao grupo (limite de 7 por grupo).
  - Menu *dropdown* para designar o Líder e o Vice-Líder de cada grupo.
  - Exclusão de grupo e remoção de integrante.

## Mapeamento de Endpoints do Back-End
- `GET /api/turmas`: Retorna as turmas existentes.
- `GET /api/turmas/:turmaId/grupos`: Retorna os grupos da turma com integrantes e líderes.
- `POST /api/turmas/:turmaId/grupos`: Cria grupo. Bloqueia o 6º grupo com HTTP 400.
- `DELETE /api/grupos/:grupoId`: Exclui grupo e seus relacionamentos.
- `POST /api/grupos/:grupoId/integrantes`: Adiciona integrante. Bloqueia o 8º integrante com HTTP 400.
- `DELETE /api/grupos/:grupoId/integrantes/:integranteId`: Remove integrante.
- `PUT /api/grupos/:grupoId/lider`: Designa o Líder do grupo.
- `PUT /api/grupos/:grupoId/vice-lider`: Designa o Vice-Líder do grupo.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/grupo.service.test.js` (Aprovado com Vitest).
