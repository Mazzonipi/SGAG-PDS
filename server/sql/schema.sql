-- ============================================================================
-- SGAG-PDS: DDL COMPLETO E CORRIGIDO (ALUNOS SEM CONTA)
-- Execute este script no SQL Editor do Supabase.
-- O back-end (service role) cria o usuário passando user_metadata { role, nome };
-- o trigger handle_new_user() cria o perfil automaticamente.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 0. LIMPEZA DE TRIGGERS E TABELAS ANTIGAS
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.avaliacoes CASCADE;
DROP TABLE IF EXISTS public.integrantes CASCADE;
DROP TABLE IF EXISTS public.grupos CASCADE;
DROP TABLE IF EXISTS public.turmas CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Apenas 1 Professor, Líderes e Vice-Líderes)
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('professor', 'lider', 'vice_lider')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trava: APENAS 1 PROFESSOR em todo o sistema
CREATE UNIQUE INDEX unique_single_professor ON public.profiles ((role)) WHERE role = 'professor';

-- ----------------------------------------------------------------------------
-- 2. TURMAS (3A, 3B, 3C, 3D)
-- ----------------------------------------------------------------------------
CREATE TABLE public.turmas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(10) UNIQUE NOT NULL CHECK (nome IN ('3A', '3B', '3C', '3D'))
);

INSERT INTO public.turmas (nome) VALUES ('3A'), ('3B'), ('3C'), ('3D');

-- ----------------------------------------------------------------------------
-- 3. GRUPOS
-- ----------------------------------------------------------------------------
CREATE TABLE public.grupos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    lider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vice_lider_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_nome_grupo_por_turma UNIQUE (turma_id, nome),
    CONSTRAINT diferenca_lider_vice CHECK (lider_id IS NULL OR vice_lider_id IS NULL OR lider_id <> vice_lider_id)
);

-- ----------------------------------------------------------------------------
-- 4. INTEGRANTES (Alunos comuns sem cadastro no sistema)
-- ----------------------------------------------------------------------------
CREATE TABLE public.integrantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    nome_aluno VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. AVALIAÇÕES (Líder/Vice/Professor avaliam o integrante)
-- ----------------------------------------------------------------------------
CREATE TABLE public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grupo_id UUID NOT NULL REFERENCES public.grupos(id) ON DELETE CASCADE,
    integrante_id UUID NOT NULL REFERENCES public.integrantes(id) ON DELETE CASCADE,
    avaliador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    interesse NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (interesse >= 0.00 AND interesse <= 0.20),
    entrega_prazo NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (entrega_prazo >= 0.00 AND entrega_prazo <= 0.20),
    participacao NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (participacao >= 0.00 AND participacao <= 0.20),
    qualidade_trabalho NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (qualidade_trabalho >= 0.00 AND qualidade_trabalho <= 0.20),
    respeito_grupo NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (respeito_grupo >= 0.00 AND respeito_grupo <= 0.20),

    nota_total NUMERIC(3,2) GENERATED ALWAYS AS (
        interesse + entrega_prazo + participacao + qualidade_trabalho + respeito_grupo
    ) STORED,

    alterado_por_professor BOOLEAN NOT NULL DEFAULT false,
    comentario_esclarecimento TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_avaliacao_por_integrante UNIQUE (grupo_id, integrante_id)
);

-- ----------------------------------------------------------------------------
-- 6. AUDIT_LOGS [BANCA-01]  (tabela obrigatória que estava faltando)
-- ----------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tabela_afetada TEXT NOT NULL,
    registro_id UUID NOT NULL,
    acao TEXT NOT NULL,
    usuario_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    detalhes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. BLOQUEIO RIGOROSO DE CADASTRO + CRIAÇÃO AUTOMÁTICA DO PERFIL
--    O back-end DEVE passar user_metadata = { role, nome } ao criar o usuário.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role VARCHAR(20);
    v_nome TEXT;
BEGIN
    v_role := NEW.raw_user_meta_data->>'role';
    v_nome := COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuario');

    -- Se tentar cadastrar sem ser professor, lider ou vice_lider, o banco cancela o cadastro
    IF v_role IS NULL OR v_role NOT IN ('professor', 'lider', 'vice_lider') THEN
        RAISE EXCEPTION 'Acesso negado: Apenas Professor, Lider e Vice-Lider podem criar conta.';
    END IF;

    INSERT INTO public.profiles (id, nome, email, role)
    VALUES (NEW.id, v_nome, NEW.email, v_role);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (escritas via service role/back-end; leitura autenticada)
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_turmas" ON public.turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_grupos" ON public.grupos FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_integrantes" ON public.integrantes FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_avaliacoes" ON public.avaliacoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "select_audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
