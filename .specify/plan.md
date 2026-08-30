# SGAG-PDS Arquitetura e Plano Técnico (plan.md)

## Arquitetura do Sistema

```
                         ┌─────────────────────────────────┐
                         │   React 19 + Vite (Client)      │
                         │   (Tailwind CSS + Lucide)       │
                         └────────────────┬────────────────┘
                                          │  HTTP REST (JWT)
                                          ▼
                         ┌─────────────────────────────────┐
                         │   Node.js + Express (Server)    │
                         │   (Zod Validation + Middlewares)│
                         └────────────────┬────────────────┘
                                          │  Supabase SDK (Admin)
                                          ▼
                         ┌─────────────────────────────────┐
                         │   Supabase PostgreSQL DB        │
                         │   (Auth, Profiles, Audit Logs)  │
                         └─────────────────────────────────┘
```

---

## Estrutura Técnica de Diretórios

### Back-End (`server/src/`)
- `config/supabase.js`: Inicialização lazy do Supabase Client Admin usando `SUPABASE_SERVICE_ROLE_KEY`.
- `middlewares/auth.middleware.js`: Extração e validação do JWT via Supabase Auth + Verificação de RBAC (`requireRoles`).
- `middlewares/error.middleware.js`: `AppError` personalizado, wrapper `asyncHandler`, tratamento global de exceções.
- `validations/schemas.js`: Schemas Zod para validar payloads de entrada de todas as rotas.
- `services/`: Lógica de domínio (`auth.service`, `profile.service`, `turma.service`, `grupo.service`, `avaliacao.service`, `dashboard.service`, `audit.service`).
- `controllers/`: Recebimento de requisições HTTP, chamada aos serviços e respostas JSON.
- `routes/`: Definição de endpoints sob o prefixo `/api`.
- `vitest.config.js`: Configuração isolada do ambiente de testes unitários e de integração do servidor.

### Front-End (`client/src/`)
- `lib/api.js`: Cliente HTTP seguro com tratamento de token Bearer e fallback para `localStorage`.
- `context/AuthContext.jsx`: Provedor de contexto de autenticação React com persistência segura.
- `components/Navbar.jsx`: Barra de navegação com badges de papéis e abas dinâmicas.
- `components/Login.jsx`: Tela de login com suporte a preenchimento rápido de demonstração.
- `components/CadastroPerfil.jsx`: **Aba de Cadastro Administrativo do Professor**.
- `components/GestaoGrupos.jsx`: Interface para gerenciar turmas, grupos, integrantes e papéis.
- `components/MatrizAvaliacao.jsx`: Matriz de avaliação com trava em modo somente leitura.
- `components/SobrescritaAvaliacao.jsx`: Interface do Professor para ajuste de notas com comentário obrigatório.
- `components/DashboardMetrics.jsx`: Dashboard visual das métricas `BANCA-02`.
- `components/AuditLogs.jsx`: Tabela imutável de histórico de auditoria `BANCA-01`.
- `App.jsx`: Componente raiz combinando roteamento por abas e `AuthProvider`.

---

## Esquema de Banco de Dados (Supabase)

- `profiles`: `id (uuid, PK)`, `nome (text)`, `email (text)`, `role (text: professor|lider|vice_lider)`, `is_active (boolean)`.
- `turmas`: `id (uuid, PK)`, `codigo (text)`, `nome_turma (text)`.
- `grupos`: `id (uuid, PK)`, `turma_id (uuid, FK)`, `nome_grupo (text)`, `lider_id (uuid, FK)`, `vice_lider_id (uuid, FK)`.
- `integrantes`: `id (uuid, PK)`, `grupo_id (uuid, FK)`, `nome_aluno (text)`.
- `avaliacoes`: `id (uuid, PK)`, `grupo_id (uuid, FK)`, `integrante_id (uuid, FK)`, `pontualidade (numeric)`, `qualidade_trabalho (numeric)`, `respeito_grupo (numeric)`, `comunicacao (numeric)`, `iniciativa (numeric)`, `comentario_esclarecimento (text)`, `alterado_por_professor (boolean)`.
- `audit_logs`: `id (uuid, PK)`, `tabela (text)`, `registro_id (text)`, `acao (text)`, `usuario_id (uuid)`, `detalhes (jsonb)`, `created_at (timestamp)`.
