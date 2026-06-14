-- ============================================================
-- MIGRAÇÃO: Adicionar colunas JSONB ao relatório de fiscalização
-- Execute no Supabase Dashboard > SQL Editor
-- ============================================================

-- Bloco de verificações (os 5 blocos funcionais)
ALTER TABLE public.relatorios
  ADD COLUMN IF NOT EXISTS verificacoes JSONB DEFAULT '{}'::jsonb;

-- Documentos e anexos
ALTER TABLE public.relatorios
  ADD COLUMN IF NOT EXISTS documentos JSONB DEFAULT '{}'::jsonb;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'relatorios'
  AND column_name IN ('verificacoes', 'documentos');
