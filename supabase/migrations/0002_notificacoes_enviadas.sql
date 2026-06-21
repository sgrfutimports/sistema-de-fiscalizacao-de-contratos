-- ====================================================================================================
-- MIGRATION: 0002_notificacoes_enviadas.sql
-- DESCRIÇÃO: Tabela para histórico de cobranças e notificações por email.
-- ====================================================================================================

CREATE TABLE public.notificacoes_enviadas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID REFERENCES public.contratos(id) ON DELETE CASCADE,
    fiscal_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    destinatario_email TEXT NOT NULL,
    destinatario_nome TEXT,
    tipo TEXT NOT NULL DEFAULT 'COBRANCA_RELATORIO',
    status TEXT NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'ENVIADO', 'FALHA'
    erro_log TEXT,
    data_envio TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadados opcionais para saber sobre que mes/ano era a cobrança
    mes_referencia TEXT,
    ano_referencia TEXT
);

-- Ativar RLS
ALTER TABLE public.notificacoes_enviadas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Apenas ADMIN pode ver todas as notificações
CREATE POLICY "Admins podem ver todas as notificações enviadas" ON public.notificacoes_enviadas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND perfil = 'ADMIN' AND ativo = true
        )
    );

-- Fiscais podem ver notificações enviadas para eles ou referentes aos contratos deles
CREATE POLICY "Fiscais podem ver suas próprias notificações" ON public.notificacoes_enviadas
    FOR SELECT USING (
        fiscal_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.contratos
            WHERE id = notificacoes_enviadas.contrato_id
            AND (fiscal_id = auth.uid() OR fiscal_substituto_id = auth.uid())
        )
    );

-- Apenas funções backend com admin role podem inserir notificações (bypass RLS)
-- ou caso a inserção ocorra via Server Action autenticada de ADMIN.
CREATE POLICY "Admins podem inserir notificações" ON public.notificacoes_enviadas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND perfil = 'ADMIN' AND ativo = true
        )
    );
