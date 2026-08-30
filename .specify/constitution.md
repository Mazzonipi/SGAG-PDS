# SGAG-PDS Constitution

## Princípios Inegociáveis do Sistema

Este documento estabelece as diretrizes fundamentais, princípios de arquitetura e regras inegociáveis para o desenvolvimento e manutenção do **SGAG-PDS (Sistema de Gestão e Avaliação de Grupos)**.

---

### 1. Princípios Globais de Engenharia

1. **Desenvolvimento Orientado a Testes (TDD)**:
   - Todo módulo, serviço ou controller deve ter cobertura de testes automatizados com **Vitest**.
   - Nenhuma funcionalidade é considerada concluída sem que a suíte `npm test` execute e passe com 100% de êxito.

2. **Isolamento de Segredos e Segurança de API**:
   - Chaves de alto privilégio como `SUPABASE_SERVICE_ROLE_KEY` devem permanecer estritamente restritas ao servidor (`server/.env`).
   - O cliente (`client/.env`) utiliza exclusivamente a chave pública anônima (`VITE_SUPABASE_ANON_KEY`).

3. **Arquitetura Monorepo Limpa**:
   - Módulo **Back-End (`server/`)**: Express.js + Supabase Admin SDK + Validações Zod.
   - Módulo **Front-End (`client/`)**: React 19 + Vite + Tailwind CSS + Lucide Icons.

---

### 2. Regras Inegociáveis de Negócio

1. **Controle de Acesso Baseado em Papéis (RBAC)**:
   - Papéis permitidos: `professor`, `lider`, `vice_lider`.
   - **Professor Único**: Não é permitido criar um segundo usuário com perfil de `professor`.
   - **Contas de Alunos**: Alunos comuns **não** possuem conta de acesso ao sistema (existem apenas como registros de integrantes dos grupos).

2. **Limites Rígidos de Capacidade**:
   - **Turmas**: Limite máximo de **5 grupos por turma**.
   - **Grupos**: Limite máximo de **7 integrantes por grupo**.
   - Violações de limite devem ser rejeitadas pela API com retorno HTTP 400/409.

3. **Trava de Submissão e Sobrescrita**:
   - O **Líder** tem prioridade na submissão das avaliações do seu grupo.
   - Se o Líder já submeteu a avaliação, a edição para o **Vice-Líder** é bloqueada (retorno HTTP 403 / modo somente leitura na UI).
   - O **Professor** pode alterar qualquer avaliação a qualquer momento, exigindo obrigatoriamente um `comentario_esclarecimento` e ativando a flag `alterado_por_professor = true`.

4. **Trilha Imutável de Auditoria (`BANCA-01`)**:
   - Todas as operações de criação, alteração ou exclusão de perfis, grupos, integrantes, designações e notas devem gerar um registro imutável em `audit_logs`.
   - Os registros de auditoria nunca podem ser alterados ou deletados.

5. **Dashboard & Métricas (`BANCA-02`)**:
   - O dashboard deve fornecer a contagem exata de turmas, grupos, avaliações concluídas e avaliações pendentes, com suporte a filtragem opcional por turma.
