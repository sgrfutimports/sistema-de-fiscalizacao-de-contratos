# Especificações do Sistema de Fiscalização de Contratos
## 71º Batalhão de Infantaria Motorizado — 71º BI Mtz

> **Desenvolvido por:** 1º Sgt Gaudêncio  
> **Stack:** Next.js 16.2.9 (Turbopack), React 19, TypeScript, Supabase (PostgreSQL + Auth), TailwindCSS v4  
> **Deploy:** Vercel (produção)  
> **Repositório:** `https://github.com/sgrfutimports/sistema-de-fiscalizacao-de-contratos`

---

## 1. Visão Geral

Sistema web militar para gerenciamento e fiscalização de contratos administrativos do 71º BI Mtz. A plataforma digitaliza o fluxo de emissão de relatórios mensais de fiscalização, controle de prazos de vigência de contratos, aprovação de relatórios por administradores e geração de certidões em PDF.

---

## 2. Arquitetura

```
src/
├── app/                          # App Router (Next.js)
│   ├── page.tsx                  # Landing page de boas-vindas (pública, estática)
│   ├── layout.tsx                # Layout raiz com fontes e tema
│   ├── globals.css               # Estilos globais + design tokens
│   ├── auth/callback/route.ts    # Handler OAuth callback (Supabase)
│   ├── login/                    # Página de login (pública, estática)
│   ├── primeiro-acesso/          # Troca de senha obrigatória no 1º acesso
│   ├── redefinir-senha/          # Redefinição de senha via link de e-mail
│   └── dashboard/                # Área protegida (requer autenticação)
│       ├── layout.tsx            # Layout do dashboard com sidebar e header
│       ├── page.tsx              # Home: visão geral e KPIs
│       ├── auditoria/            # Log de auditoria (ADMIN)
│       ├── comunicados/          # Comunicados do sistema (ADMIN)
│       ├── contratos/            # Gerenciamento de contratos (ADMIN/FISCAL)
│       ├── fila/                 # Fila de homologação de relatórios (ADMIN)
│       ├── meus-contratos/       # Contratos do fiscal logado
│       ├── meus-relatorios/      # Relatórios enviados pelo fiscal logado
│       ├── perfil/               # Perfil do usuário + troca de senha
│       ├── prazos/               # Alertas de vencimento de contratos
│       ├── relatorios/           # Acervo de relatórios (ADMIN) + submissão
│       └── usuarios/             # Gerenciamento de militares/usuários (ADMIN)
├── components/
│   ├── auth/                     # Formulários de autenticação
│   ├── dashboard/                # Componentes do painel principal
│   └── ui/                       # Componentes base (shadcn/ui)
├── lib/supabase/
│   ├── client.ts                 # Cliente browser (SSR)
│   ├── server.ts                 # Cliente servidor (SSR + cookies)
│   └── admin.ts                  # Cliente admin (Service Role Key, bypassa RLS)
└── proxy.ts                      # Middleware de autenticação Next.js (proxy)
```

---

## 3. Banco de Dados (Supabase / PostgreSQL)

### 3.1 Enums

| Enum | Valores |
|---|---|
| `perfil_enum` | `ADMIN`, `FISCAL_TITULAR`, `FISCAL_SUBSTITUTO` |
| `status_contrato_enum` | `ATIVO`, `SUSPENSO`, `ENCERRADO` |
| `status_relatorio_enum` | `ENVIADO`, `EM_ANALISE`, `APROVADO`, `DEVOLVIDO`, `ARQUIVADO` |

### 3.2 Tabelas

#### `public.users`
| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | UUID | PK, FK `auth.users(id)` |
| `nome` | TEXT | NOT NULL |
| `posto_graduacao` | TEXT | NOT NULL |
| `nome_guerra` | TEXT | NOT NULL |
| `cpf` | TEXT | UNIQUE, NOT NULL |
| `email` | TEXT | UNIQUE, NOT NULL |
| `telefone` | TEXT | - |
| `perfil` | perfil_enum | DEFAULT `FISCAL_TITULAR`, NOT NULL |
| `ativo` | BOOLEAN | DEFAULT `true`, NOT NULL |
| `primeiro_acesso` | BOOLEAN | DEFAULT `true`, NOT NULL |
| `ultimo_acesso` | TIMESTAMPTZ | - |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` |

#### `public.contratos`
| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | UUID | PK |
| `numero_contrato` | TEXT | NOT NULL |
| `processo_administrativo` | TEXT | - |
| `empresa` | TEXT | NOT NULL |
| `cnpj` | TEXT | NOT NULL |
| `objeto` | TEXT | NOT NULL |
| `valor` | NUMERIC(15,2) | NOT NULL |
| `data_inicio` | DATE | NOT NULL |
| `data_termino` | DATE | NOT NULL |
| `fiscal_titular_id` | UUID | FK `users(id)` |
| `fiscal_substituto_id` | UUID | FK `users(id)` |
| `titular_ativo` | BOOLEAN | DEFAULT `true`, NOT NULL |
| `status` | status_contrato_enum | DEFAULT `ATIVO`, NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` |

#### `public.relatorios`
| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | UUID | PK |
| `contrato_id` | UUID | FK `contratos(id)`, NOT NULL |
| `competencia_mes` | INTEGER | CHECK 1–12, NOT NULL |
| `competencia_ano` | INTEGER | NOT NULL |
| `fiscal_id` | UUID | FK `users(id)`, NOT NULL |
| `tipo_fiscal` | TEXT | CHECK `Titular` ou `Substituto` |
| `fiscalizacao_realizada` | BOOLEAN | NOT NULL |
| `servico_conforme` | BOOLEAN | NOT NULL |
| `documentacao_apresentada` | BOOLEAN | NOT NULL |
| `ocorrencias` | TEXT | - |
| `pendencias` | TEXT | - |
| `observacoes` | TEXT | - |
| `status` | status_relatorio_enum | DEFAULT `ENVIADO`, NOT NULL |
| `parecer_administrador` | TEXT | - |
| `data_envio` | TIMESTAMPTZ | DEFAULT `now()` |
| `data_aprovacao` | TIMESTAMPTZ | - |
| `pdf_url` | TEXT | - |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` |
| UNIQUE | — | `(contrato_id, competencia_mes, competencia_ano)` |

#### `public.logs`
| Coluna | Tipo | Restrições |
|---|---|---|
| `id` | UUID | PK |
| `usuario` | TEXT | NOT NULL |
| `cpf` | TEXT | NOT NULL |
| `perfil` | TEXT | NOT NULL |
| `operacao` | TEXT | NOT NULL |
| `descricao` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | DEFAULT `now()` |

### 3.3 Row Level Security (RLS)

| Tabela | Política |
|---|---|
| `users` | Usuário vê apenas seus dados; ADMIN vê e gerencia todos |
| `contratos` | ADMIN tem acesso total; Fiscais veem apenas contratos vinculados a eles |
| `relatorios` | ADMIN tem acesso total; Fiscais veem e inserem apenas em contratos vinculados; só editam relatórios com status `DEVOLVIDO` |
| `logs` | Apenas ADMIN pode ler; qualquer autenticado pode inserir |

---

## 4. Autenticação e Autorização

### 4.1 Fluxo de Login
- **Credencial:** CPF (sem pontuação) + Senha
- O CPF é usado para buscar o e-mail real na tabela `users`
- Login efetivo via `supabase.auth.signInWithPassword` com o e-mail real
- Usuário inativo (`ativo = false`) não consegue acessar
- No primeiro acesso (`primeiro_acesso = true`), é redirecionado para `/primeiro-acesso`

### 4.2 Middleware de Proteção de Rotas (`src/proxy.ts`)
- **Rotas públicas:** `/`, `/login`, `/auth/callback`, `/redefinir-senha`
- **Rotas protegidas:** qualquer outra rota redireciona para `/login` se sem sessão
- Usuário logado tentando acessar `/login` é redirecionado para `/dashboard`

### 4.3 Perfis e Permissões
| Perfil | Descrição | Permissões |
|---|---|---|
| `ADMIN` | Administrador do sistema | Acesso total: gerencia usuários, contratos, relatórios, auditoria e comunicados |
| `FISCAL_TITULAR` | Fiscal principal do contrato | Vê e fiscaliza seus contratos; emite relatórios mensais; acessa meus-contratos e meus-relatórios |
| `FISCAL_SUBSTITUTO` | Fiscal substituto do contrato | Mesmas permissões que o titular, mas nos contratos em que é substituto |

### 4.4 Recuperação de Senha
- Fluxo via e-mail: Admin informa CPF → sistema envia link de redefinição para o e-mail cadastrado
- O e-mail é mascarado no feedback (ex: `r******o@gmail.com`) por segurança
- Redirecionamento OAuth após clique no link: `/auth/callback?next=/redefinir-senha`

---

## 5. Rotas e Funcionalidades

### 5.1 Rotas Públicas

| Rota | Tipo | Descrição |
|---|---|---|
| `/` | Static | Landing page de boas-vindas com features, CTA e rodapé com créditos |
| `/login` | Static | Formulário de login CPF + Senha, link para redefinir senha |
| `/primeiro-acesso` | Static | Formulário de troca de senha obrigatória no primeiro acesso |
| `/redefinir-senha` | Static | Formulário de redefinição de senha após link de e-mail |
| `/auth/callback` | Dynamic | Handler SSR para callback OAuth do Supabase |

### 5.2 Rotas do Dashboard (Protegidas)

| Rota | Tipo | Acesso | Descrição |
|---|---|---|---|
| `/dashboard` | Dynamic | Todos | Home com KPIs: total de contratos, relatórios pendentes, prazos próximos |
| `/dashboard/contratos` | Dynamic | Todos (escopo filtrado por perfil) | Listagem e gestão de contratos |
| `/dashboard/contratos/novo` | Dynamic | ADMIN | Formulário de criação de novo contrato |
| `/dashboard/meus-contratos` | Dynamic | FISCAL | Contratos vinculados ao fiscal logado |
| `/dashboard/meus-relatorios` | Dynamic | FISCAL | Relatórios enviados pelo fiscal logado |
| `/dashboard/relatorios` | Dynamic | ADMIN | Acervo completo de todos os relatórios |
| `/dashboard/relatorios/[id]` | Dynamic | ADMIN | Visualização e análise de relatório específico |
| `/dashboard/relatorios/[id]/imprimir` | Dynamic | ADMIN/FISCAL | Geração de certidão em PDF para impressão |
| `/dashboard/relatorios/novo/[contrato_id]` | Dynamic | FISCAL | Formulário de envio de relatório individual |
| `/dashboard/relatorios/novo-unificado` | Dynamic | FISCAL | Formulário de envio unificado para múltiplos contratos |
| `/dashboard/relatorios/unificado/[mes]/[ano]/imprimir` | Dynamic | Todos | Certidão unificada em PDF por período |
| `/dashboard/fila` | Dynamic | ADMIN | Fila de homologação (relatórios em `ENVIADO` ou `EM_ANALISE`) |
| `/dashboard/prazos` | Dynamic | Todos | Alertas de contratos próximos ao vencimento |
| `/dashboard/usuarios` | Dynamic | ADMIN | Gerenciamento de militares/usuários |
| `/dashboard/auditoria` | Dynamic | ADMIN | Log completo de auditoria das ações no sistema |
| `/dashboard/comunicados` | Dynamic | Todos | Comunicados do sistema; ADMIN pode criar/editar/excluir |
| `/dashboard/perfil` | Dynamic | Todos | Dados do perfil e alteração de senha |

---

## 6. Regras de Negócio

### 6.1 Contratos
- Um fiscal (titular ou substituto) pode estar vinculado a no máximo **5 contratos ativos** simultâneos
- Fiscal titular e substituto de um mesmo contrato **não podem ser a mesma pessoa**
- Apenas `ADMIN` pode criar, editar ou encerrar/suspender contratos
- Fiscais só veem contratos dos quais são titulares ou substitutos

### 6.2 Relatórios
- **Um relatório por competência** (mês/ano) por contrato — constraint UNIQUE no banco
- Fiscal pode reenviar relatórios com status `DEVOLVIDO`
- ADMIN pode aprovar (`APROVADO`) ou devolver (`DEVOLVIDO`) relatórios da fila
- Exclusão de relatório requer **confirmação da senha** do administrador
- Fiscais não podem excluir relatórios — apenas ADMIN

### 6.3 Usuários
- Senha inicial = CPF sem pontuação (11 dígitos)
- Novo usuário tem `primeiro_acesso = true` e é forçado a criar nova senha no primeiro login
- ADMIN pode resetar a senha de qualquer usuário para o CPF padrão
- ADMIN **não pode excluir a si mesmo**
- Não é possível excluir militar com contratos ativos ou com relatórios históricos registrados
- Exclusão de usuário requer confirmação da senha do administrador

### 6.4 Auditoria (Logs)
- Operações registradas: `RESET_SENHA`, `ATUALIZAR_USUARIO`, `EXCLUIR_USUARIO`, `ENVIO_RELATORIO`, `ATUALIZACAO_RELATORIO`, `ENVIO_RELATORIO_UNIFICADO`, `EXCLUIR_RELATORIO`
- Logs são imutáveis — nenhum perfil pode excluí-los via interface

---

## 7. Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon/pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Chave de Service Role (usada exclusivamente no servidor, nunca exposta no cliente) |

> **Atenção:** A `SUPABASE_SERVICE_ROLE_KEY` bypassa completamente o RLS. Deve ser usada apenas em Server Actions e API Routes — **jamais no cliente**.

---

## 8. Casos de Teste Prioritários

### 8.1 Autenticação

| ID | Cenário | Resultado Esperado |
|---|---|---|
| AUTH-01 | Login com CPF e senha corretos | Redirecionado para `/dashboard` |
| AUTH-02 | Login com CPF correto e senha errada | Mensagem de erro: "CPF ou senha inválidos" |
| AUTH-03 | Login com CPF inexistente | Mensagem de erro: "CPF ou senha inválidos" |
| AUTH-04 | Login com usuário inativo | Mensagem de erro: "Este usuário está inativo no sistema" |
| AUTH-05 | Primeiro acesso após login | Redirecionado para `/primeiro-acesso` |
| AUTH-06 | Acesso a `/dashboard` sem sessão | Redirecionado para `/login` |
| AUTH-07 | Usuário logado acessa `/login` | Redirecionado para `/dashboard` |
| AUTH-08 | Recuperação de senha com CPF válido | E-mail enviado, exibe e-mail mascarado |
| AUTH-09 | Recuperação com CPF inválido | Mensagem de erro: "Nenhum usuário encontrado com este CPF" |
| AUTH-10 | Logout | Sessão encerrada, redirecionado para `/login` |

### 8.2 Contratos

| ID | Cenário | Resultado Esperado |
|---|---|---|
| CON-01 | ADMIN cria contrato com todos os campos válidos | Contrato criado com sucesso |
| CON-02 | ADMIN tenta criar contrato com mesmo titular e substituto | Erro: "não podem ser a mesma pessoa" |
| CON-03 | ADMIN tenta vincular fiscal que já tem 5 contratos ativos como titular | Erro: limite máximo atingido |
| CON-04 | ADMIN tenta vincular fiscal que já tem 5 contratos ativos como substituto | Erro: limite máximo atingido |
| CON-05 | FISCAL tenta criar contrato | Erro: "Apenas administradores podem gerenciar contratos" |
| CON-06 | ADMIN edita contrato, alterando status para ENCERRADO | Contrato atualizado com sucesso |
| CON-07 | FISCAL visualiza lista de contratos | Vê apenas seus contratos (titular ou substituto) |

### 8.3 Relatórios

| ID | Cenário | Resultado Esperado |
|---|---|---|
| REL-01 | FISCAL envia relatório para competência sem relatório existente | Relatório criado com status `ENVIADO` |
| REL-02 | FISCAL tenta enviar relatório para competência já preenchida | Erro: "Já existe um relatório submetido para este contrato neste mês/ano" |
| REL-03 | FISCAL reenvia relatório com status `DEVOLVIDO` | Relatório atualizado e status volta para `ENVIADO` |
| REL-04 | ADMIN aprova relatório da fila | Status alterado para `APROVADO`, data de aprovação registrada |
| REL-05 | ADMIN devolve relatório com parecer | Status alterado para `DEVOLVIDO`, parecer salvo |
| REL-06 | ADMIN exclui relatório com senha correta | Relatório excluído, log de auditoria registrado |
| REL-07 | ADMIN tenta excluir relatório com senha errada | Erro: "Senha de confirmação incorreta" |
| REL-08 | FISCAL envia relatório unificado para múltiplos contratos | Todos os relatórios criados com sucesso |
| REL-09 | FISCAL tenta excluir relatório | Erro: não autorizado |
| REL-10 | Geração de PDF/certidão do relatório aprovado | Página de impressão renderizada corretamente |

### 8.4 Usuários

| ID | Cenário | Resultado Esperado |
|---|---|---|
| USU-01 | ADMIN cria novo militar com dados válidos | Usuário criado com senha = CPF, `primeiro_acesso = true` |
| USU-02 | ADMIN cria usuário com CPF inválido (≠ 11 dígitos) | Erro: "CPF inválido" |
| USU-03 | ADMIN cria usuário com e-mail duplicado | Erro: "Usuário com este e-mail já existe" |
| USU-04 | ADMIN reseta senha de militar | Senha redefinida para CPF, `primeiro_acesso = true`, log registrado |
| USU-05 | ADMIN edita dados de militar | Dados atualizados com sucesso, log registrado |
| USU-06 | ADMIN desativa militar (ativo = false) | Militar não consegue mais fazer login |
| USU-07 | ADMIN tenta excluir militar com contratos ativos | Erro: "está vinculado como fiscal em contratos ativos" |
| USU-08 | ADMIN tenta excluir militar com relatórios históricos | Erro: "possui relatórios históricos registrados" |
| USU-09 | ADMIN exclui militar sem vínculos com senha correta | Usuário excluído do banco e do Auth, log registrado |
| USU-10 | ADMIN tenta excluir a si mesmo | Erro: "Você não pode excluir a sua própria conta" |
| USU-11 | FISCAL tenta acessar `/dashboard/usuarios` | Não tem acesso (rota não disponível no perfil) |

### 8.5 Segurança

| ID | Cenário | Resultado Esperado |
|---|---|---|
| SEG-01 | Acesso direto a rota protegida sem autenticação | Redirecionado para `/login` |
| SEG-02 | FISCAL tenta chamar Server Action de ADMIN diretamente | Retorna erro "Não autorizado" ou "Apenas administradores" |
| SEG-03 | `SUPABASE_SERVICE_ROLE_KEY` exposta no bundle cliente | **Não deve aparecer** — verificar com DevTools Network |
| SEG-04 | RLS: FISCAL tenta ler contratos de outro fiscal via Supabase | Retorna conjunto vazio (RLS bloqueia) |
| SEG-05 | RLS: FISCAL tenta ler logs de auditoria | Retorna conjunto vazio (RLS bloqueia) |

---

## 9. Dependências Principais

| Pacote | Versão | Finalidade |
|---|---|---|
| `next` | 16.2.9 | Framework React com App Router e Turbopack |
| `react` | 19.2.4 | Biblioteca UI |
| `@supabase/ssr` | ^0.12.0 | Autenticação e banco com SSR |
| `@supabase/supabase-js` | ^2.108.1 | SDK Supabase |
| `tailwindcss` | ^4 | CSS utilitário |
| `lucide-react` | ^1.18.0 | Ícones |
| `react-hook-form` | ^7.78.0 | Formulários |
| `zod` | ^4.4.3 | Validação de schemas |
| `recharts` | ^3.8.1 | Gráficos e charts |
| `sonner` | ^2.0.7 | Notificações toast |
| `@tanstack/react-table` | ^8.21.3 | Tabelas com ordenação/filtro |

---

## 10. Instruções para Deploy na Vercel

1. Conectar o repositório GitHub ao projeto Vercel
2. Configurar as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Verificar que o build passa sem erros (`npm run build`)
4. Configurar o domínio de produção nas opções de `Redirect URLs` do Supabase Auth

---

*Documento gerado em 16/06/2026. Desenvolvido por 1º Sgt Gaudêncio.*
