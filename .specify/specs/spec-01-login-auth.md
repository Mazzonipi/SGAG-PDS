# SPEC-01: Módulo de Login e Autenticação

## Objetivo
Prover autenticação via token JWT para todos os papéis do sistema (`professor`, `lider`, `vice_lider`), mantendo o estado de sessão seguro.

## Especificação da Interface Front-End
- **Componente**: `client/src/components/Login.jsx`
- **Funcionalidades**:
  - Formulário com campos para **E-mail** e **Senha**.
  - Validação visual de erros e estado de carregamento (*spinner*).
  - Atalhos de preenchimento rápido para ambiente de teste (`professor@sgag.com`, `lider1@sgag.com`).

## Mapeamento de Endpoints do Back-End
- `POST /api/auth/login`: Autentica e retorna `{ token, user: { id, nome, email, role } }`.
- `GET /api/auth/me`: Valida o token JWT no header `Authorization: Bearer <token>` e retorna o perfil ativo.

## Verificação de Testes Back-End
- Arquivo de teste: `server/src/tests/auth.service.test.js` e `server/src/tests/auth.middleware.test.js` (Aprovados com Vitest).
