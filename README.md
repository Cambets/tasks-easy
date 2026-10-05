# Central de Tarefas IA

Plataforma SaaS de alta produtividade pessoal e de equipe construída em português brasileiro, integrando metodologias comprovadas como a **Tríade do Tempo** e a **Matriz de Eisenhower**.

## 🛠️ Stack Tecnológica

- **Framework**: [TanStack Start](https://tanstack.com/start) com Vite 7 & React 19
- **Roteamento**: File-based routing sob `src/routes/` com tipagem estrita
- **Linguagem**: TypeScript Strict
- **Estilização**: Tailwind CSS v4 com tokens semânticos OKLCH em `src/styles.css`
- **Componentes**: shadcn/ui customizado com tokens semânticos (sem cores hardcoded)
- **Ícones**: `lucide-react` com SVG oficial da marca
- **Estado do Servidor & Cache**: TanStack Query (`@tanstack/react-query`) com mutações otimistas
- **Estado de Interface**: Zustand (`src/stores/ui.ts`) com persistência de sidebar e tema
- **Validação de Esquemas**: Zod
- **Notificações**: Sonner (toasts interativos)
- **Backend & Autenticação**: Supabase (Auth, Postgres, Row-Level Security e Triggers)
- **Visualização de Dados**: Recharts

---

## 🚀 Como Executar

### 1. Clonar e Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo para `.env`:

```bash
cp .env.example .env
```

Preencha as variáveis em `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica-anon
```

> **Modo Demonstração Offline**: Caso as variáveis do Supabase não estejam preenchidas ou usem valores de exemplo, o aplicativo inicializa automaticamente com armazenamento local e dados de exemplo para demonstração e testes rápidos.

### 3. Aplicar Migração no Supabase

Execute a migração SQL única localizada em:
[`supabase/migrations/20261005000000_central_de_tarefas.sql`](supabase/migrations/20261005000000_central_de_tarefas.sql)

Esta migração configura:
- **Enums**: `task_status`, `task_priority`, `time_sphere`
- **Função Utilitária**: `public.set_updated_at()`
- **Tabelas com RLS**: `tasks`, `checklist_items`, `tags`, `task_tags`, `attachments`
- **Políticas RLS**: Isolamento estrito de dados por `auth.uid() = user_id`
- **Trigger de Boas-Vindas**: `public.seed_example_tasks()` disparado automaticamente ao criar novo usuário no Supabase Auth

### 4. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173) no seu navegador.

### 5. Compilar para Produção

```bash
npm run build
```

---

## 🧭 Estrutura de Rotas e Navegação

Todas as telas do aplicativo estão organizadas sob rotas baseadas em arquivo:

- `/` → Redirecionamento automático (`/todas` se autenticado, `/auth` caso contrário)
- `/auth` → Tela de login/cadastro com tabs centralizadas e botão Google OAuth
- `/auth/forgot` → Solicitação de e-mail para recuperação de senha
- `/auth/callback` → Processamento de retorno do Google OAuth com redirecionamento dinâmico
- `/reset-password` → Definição de nova senha via token de recuperação
- `/_authenticated/` (Layout com proteção de autenticação e Sidebar colapsável):
  - `/hoje` → Tarefas agendadas para hoje ou marcadas como foco prioritário
  - `/inbox` → Caixa de entrada para descarrego rápido
  - `/proximos` → Visão dos próximos 7 dias
  - `/todas` → Lista geral com suporte a exibir/ocultar concluídas
  - `/kanban` → Quadro interativo com 4 colunas (Caixa de entrada, A fazer, Em andamento, Concluído)
  - `/calendario` → Visualização mensal com adição rápida ao clicar no dia
  - `/produtividade` → Matriz de Eisenhower 2x2 (Importante × Urgente)
  - `/triade` → Gestão visual da Tríade do Tempo com gráfico de equilíbrio percentual
  - `/dashboard` → Métricas globais e gráfico de tarefas concluídas nos últimos 7 dias

---

## ⌨️ Atalhos de Teclado

- <kbd>N</kbd> : Abrir criação rápida de tarefa inline
- <kbd>/</kbd> : Focar imediatamente no campo de busca de tarefas
- <kbd>Esc</kbd> : Fechar o TaskDrawer lateral ou limpar modais
