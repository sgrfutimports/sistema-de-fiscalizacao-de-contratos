-- ENUMS
CREATE TYPE perfil_enum AS ENUM ('ADMIN', 'FISCAL_TITULAR', 'FISCAL_SUBSTITUTO');
CREATE TYPE status_contrato_enum AS ENUM ('ATIVO', 'SUSPENSO', 'ENCERRADO');
CREATE TYPE status_relatorio_enum AS ENUM ('ENVIADO', 'EM_ANALISE', 'APROVADO', 'DEVOLVIDO', 'ARQUIVADO');

-- TABLE: USERS
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    nome TEXT NOT NULL,
    posto_graduacao TEXT NOT NULL,
    nome_guerra TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    perfil perfil_enum DEFAULT 'FISCAL_TITULAR'::perfil_enum NOT NULL,
    ativo BOOLEAN DEFAULT true NOT NULL,
    primeiro_acesso BOOLEAN DEFAULT true NOT NULL,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE: CONTRATOS
CREATE TABLE public.contratos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_contrato TEXT NOT NULL,
    processo_administrativo TEXT,
    empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    objeto TEXT NOT NULL,
    valor NUMERIC(15,2) NOT NULL,
    data_inicio DATE NOT NULL,
    data_termino DATE NOT NULL,
    fiscal_titular_id UUID REFERENCES public.users(id),
    fiscal_substituto_id UUID REFERENCES public.users(id),
    titular_ativo BOOLEAN DEFAULT true NOT NULL,
    status status_contrato_enum DEFAULT 'ATIVO'::status_contrato_enum NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TABLE: RELATORIOS
CREATE TABLE public.relatorios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID REFERENCES public.contratos(id) NOT NULL,
    competencia_mes INTEGER NOT NULL CHECK (competencia_mes >= 1 AND competencia_mes <= 12),
    competencia_ano INTEGER NOT NULL,
    fiscal_id UUID REFERENCES public.users(id) NOT NULL,
    tipo_fiscal TEXT NOT NULL CHECK (tipo_fiscal IN ('Titular', 'Substituto')),
    fiscalizacao_realizada BOOLEAN NOT NULL,
    servico_conforme BOOLEAN NOT NULL,
    documentacao_apresentada BOOLEAN NOT NULL,
    ocorrencias TEXT,
    pendencias TEXT,
    observacoes TEXT,
    status status_relatorio_enum DEFAULT 'ENVIADO'::status_relatorio_enum NOT NULL,
    parecer_administrador TEXT,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (contrato_id, competencia_mes, competencia_ano)
);

-- TABLE: LOGS (Auditoria)
CREATE TABLE public.logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario TEXT NOT NULL,
    cpf TEXT NOT NULL,
    perfil TEXT NOT NULL,
    operacao TEXT NOT NULL,
    descricao TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR USERS
CREATE POLICY "Usuários podem ver seus próprios dados" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins podem ver todos os usuários" ON public.users FOR SELECT USING (
    (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Admins podem inserir/atualizar usuários" ON public.users FOR ALL USING (
    (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);

-- RLS POLICIES FOR CONTRATOS
CREATE POLICY "Admins podem tudo em contratos" ON public.contratos FOR ALL USING (
    (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Fiscais podem ver contratos vinculados a eles" ON public.contratos FOR SELECT USING (
    fiscal_titular_id = auth.uid() OR fiscal_substituto_id = auth.uid()
);

-- RLS POLICIES FOR RELATORIOS
CREATE POLICY "Admins podem tudo em relatórios" ON public.relatorios FOR ALL USING (
    (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Fiscais podem ver seus relatórios" ON public.relatorios FOR SELECT USING (
    fiscal_id = auth.uid() OR
    contrato_id IN (SELECT id FROM public.contratos WHERE fiscal_titular_id = auth.uid() OR fiscal_substituto_id = auth.uid())
);
CREATE POLICY "Fiscais podem inserir relatórios em seus contratos" ON public.relatorios FOR INSERT WITH CHECK (
    auth.uid() = fiscal_id AND
    contrato_id IN (SELECT id FROM public.contratos WHERE fiscal_titular_id = auth.uid() OR fiscal_substituto_id = auth.uid())
);
CREATE POLICY "Fiscais podem editar relatórios devolvidos" ON public.relatorios FOR UPDATE USING (
    auth.uid() = fiscal_id AND status = 'DEVOLVIDO'
);

-- RLS POLICIES FOR LOGS
CREATE POLICY "Apenas Admins podem ver logs" ON public.logs FOR SELECT USING (
    (SELECT perfil FROM public.users WHERE id = auth.uid()) = 'ADMIN'
);
CREATE POLICY "Todos podem inserir logs do sistema" ON public.logs FOR INSERT WITH CHECK (true);

-- STORAGE SETUP
-- Requires creating bucket "relatorios" manually in Supabase Dashboard and applying policies.
-- Bucket: relatorios (private or public depending on your needs, likely private)
