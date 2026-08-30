# SGAG-PDS Lista de Tarefas (tasks.md)

## Status Geral do Projeto

- [x] Configuração da Arquitetura Monorepo (Node.js + Express + React + Vite + Tailwind CSS)
- [x] Configuração e Isolamento das Suítes de Teste com Vitest no Server e Client
- [x] Implementação da API Back-End com Supabase Admin SDK e Zod
- [x] Implementação do Middleware de Autenticação e Autorização RBAC
- [x] Implementação da Trilha Imutável de Auditoria (`BANCA-01`)
- [x] Implementação das Métricas do Dashboard (`BANCA-02`)
- [x] Desenvolvimento do Cliente HTTP `apiFetch` com tratamento seguro de `localStorage`
- [x] Desenvolvimento da Interface Front-End com AuthContext e Navbar Responsiva
- [x] Desenvolvimento da **Aba de Cadastro Administrativo de Perfis** (Professor)
- [x] Desenvolvimento da Tela de Gestão de Turmas, Grupos e Integrantes
- [x] Desenvolvimento da Matriz de Avaliação com Trava de Submissão para Vice-Líder
- [x] Desenvolvimento da Tela de Sobrescrita de Avaliação pelo Professor com Comentário Obrigatório
- [x] Desenvolvimento do Painel de Dashboard e Visualização de Logs de Auditoria
- [x] Execução e Aprovação dos 56 Testes Automatizados

### Fase 2 — Refinamento da Experiência (concluído)
- [x] **SPEC-08**: Landing Page pública com design premium e gradiente animado CSS (`LandingPage.jsx`)
- [x] **SPEC-09**: Dashboard unificado do Professor — lista de grupos em Accordion com edição inline de notas
- [x] Campo "Esclarecimento" com aparição condicional e animação ao alterar notas
- [x] Remoção da aba isolada de Sobrescrita — funcionalidade integrada na tela principal
- [x] Reorganização da Navbar (Professor entra direto no Dashboard)
- [x] Alias `@/` configurado no `vite.config.js` para imports de `components/ui/`
- [x] Componente `ui/login-form.jsx` criado com padrão shadcn (estrutura de componentes reutilizáveis)

---

## Tarefas de Manutenção e Verificação Futuras

1. **Validação da Suíte de Testes Automatizados**:
   ```bash
   npm test
   ```
   - Garantir que todos os 54 testes do servidor e 2 testes do cliente permaneçam verdes.

2. **Execução Simultânea em Desenvolvimento**:
   ```bash
   npm run dev
   ```
   - Servidor rodando na porta `5000` (`http://localhost:5000`).
   - Cliente React rodando na porta `5173` (`http://localhost:5173`).

3. **Inspecionar Especificações do Spec Kit**:
   - Princípios e Regras: [.specify/constitution.md](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/constitution.md)
   - Especificação Funcional: [.specify/spec.md](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/spec.md)
   - Arquitetura Técnica: [.specify/plan.md](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/plan.md)
   - Lista de Tarefas: [.specify/tasks.md](file:///c:/Users/eduardo/Downloads/SGAG-PDS-main/.specify/tasks.md)
