# SPEC-02: Módulo de Cadastro Administrativo de Perfis

## Objetivo
Permitir que o **Professor** cadastre novas contas de acesso para **Líderes** e **Vice-Líderes**, respeitando o bloqueio de cadastro de segundo professor ou aluno comum.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/CadastroPerfil.jsx`
- **Funcionalidades**:
  - Formulário com Nome, E-mail, Senha e Papel (`lider` / `vice_lider`).
  - Tabela com lista dos perfis cadastrados e ativos no sistema.
  - Alertas de sucesso e erro.

## Mapeamento de Endpoints do Back-End
- `POST /api/profiles`: (Exclusivo Professor - RBAC `requireRoles('professor')`).
  - Bloqueia `role: 'professor'` (HTTP 400 - "Não é permitido criar um segundo professor").
  - Bloqueia `role: 'aluno'` (HTTP 400 - "Alunos comuns não possuem conta de acesso").
  - Cria o usuário em `auth.users` e no perfil `profiles`.
  - Registra a ação no `audit_logs`.
- `GET /api/profiles`: Lista os perfis cadastrados no sistema.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/profile.service.test.js` (Aprovado com Vitest).
