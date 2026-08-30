# SGAG-PDS Especificação Funcional (spec.md)

## Visão Geral do Produto

O **SGAG-PDS** é um sistema web desenvolvido para automatizar a gestão de grupos de trabalho acadêmicos e a aplicação de matrizes de avaliação por pares e lideranças, garantindo rastreabilidade, auditoria e métricas gerenciais.

---

## Sub-Especificações por Módulo (`.specify/specs/`)

As especificações detalhadas de cada funcionalidade e tela do sistema foram divididas em documentos individuais:

1. **[SPEC-01: Módulo de Login e Autenticação](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-01-login-auth.md)**
   - Autenticação via JWT para Professor, Líder e Vice-Líder com verificação de perfil.
2. **[SPEC-02: Módulo de Cadastro Administrativo de Perfis](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-02-cadastro-perfis.md)**
   - Aba no painel do Professor para cadastrar contas de Líderes e Vice-Líderes.
3. **[SPEC-03: Módulo de Gestão de Turmas e Grupos](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-03-gestao-grupos.md)**
   - Criação de grupos (máx. 5), integrantes alunos (máx. 7) e designação de papéis.
4. **[SPEC-04: Módulo de Matriz de Avaliação](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-04-matriz-avaliacao.md)**
   - Avaliação em 5 critérios com trava de submissão prioritária para o Líder.
5. **[SPEC-05: Módulo de Sobrescrita pelo Professor](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-05-sobrescrita-professor.md)**
   - Ajuste de notas com obrigatoriedade de comentário de esclarecimento.
6. **[SPEC-06: Módulo de Dashboard e Métricas (BANCA-02)](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-06-dashboard-banca02.md)**
   - Visão consolidada de estatísticas e progresso de avaliações com filtro de turma.
7. **[SPEC-07: Módulo de Trilha Imutável de Auditoria (BANCA-01)](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/specs/spec-07-auditoria-banca01.md)**
   - Tabela imutável de logs de alteração rastreáveis por usuário.
