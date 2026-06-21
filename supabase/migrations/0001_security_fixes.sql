-- MIGRATION: 0001_security_fixes.sql
-- DESCRIÇÃO: Correções Críticas de Segurança de RLS (Recursão Infinita) e spoofing de Logs

-- 1. Criação de Função SECURITY DEFINER para obter o perfil atual sem causar Recursão
-- A função executa como o dono do banco (postgres) para poder ler a tabela users sem engatilhar RLS
CREATE OR REPLACE FUNCTION public.get_current_user_perfil()
RETURNS public.perfil_enum
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT perfil FROM public.users WHERE id = auth.uid();
$$;

-- 2. Correção de RLS na Tabela: USERS
DROP POLICY IF EXISTS "Admins podem ver todos os usuários" ON public.users;
DROP POLICY IF EXISTS "Admins podem inserir/atualizar usuários" ON public.users;

CREATE POLICY "Admins podem ver todos os usuários" 
ON public.users FOR SELECT 
USING (public.get_current_user_perfil() = 'ADMIN');

CREATE POLICY "Admins podem inserir/atualizar usuários" 
ON public.users FOR ALL 
USING (public.get_current_user_perfil() = 'ADMIN');

-- 3. Correção de RLS na Tabela: CONTRATOS
DROP POLICY IF EXISTS "Admins podem tudo em contratos" ON public.contratos;

CREATE POLICY "Admins podem tudo em contratos" 
ON public.contratos FOR ALL 
USING (public.get_current_user_perfil() = 'ADMIN');

-- 4. Correção de RLS na Tabela: RELATORIOS
DROP POLICY IF EXISTS "Admins podem tudo em relatórios" ON public.relatorios;

CREATE POLICY "Admins podem tudo em relatórios" 
ON public.relatorios FOR ALL 
USING (public.get_current_user_perfil() = 'ADMIN');

-- 5. Correção de RLS e Prevenção de Spoofing na Tabela: LOGS
DROP POLICY IF EXISTS "Apenas Admins podem ver logs" ON public.logs;
DROP POLICY IF EXISTS "Todos podem inserir logs do sistema" ON public.logs;

CREATE POLICY "Apenas Admins podem ver logs" 
ON public.logs FOR SELECT 
USING (public.get_current_user_perfil() = 'ADMIN');

-- Removemos intencionalmente a permissão de INSERT para usuários normais/anônimos!
-- A partir de agora, Logs só podem ser inseridos via "adminClient" (service_role) no servidor (Server Actions), garantindo a integridade da trilha de auditoria.
