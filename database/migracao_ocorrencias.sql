-- ============================================================
--  Migração: Ocorrências de Justificativa + campo motivo_outros
--  Executar no Supabase SQL Editor
-- ============================================================

-- 1. Nova tabela para ocorrências (Entrada, Saída Almoço, etc.)
CREATE TABLE IF NOT EXISTS justificativa_ocorrencias (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  justificativa_id UUID        NOT NULL REFERENCES justificativas(id) ON DELETE CASCADE,
  tipo_ocorrencia  TEXT        NOT NULL,  -- 'entrada', 'saida_almoco', 'retorno_almoco', 'saida', 'dia_inteiro'
  horario_correto  TIME,                  -- horário correto informado pelo colaborador
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_tipo_ocorrencia CHECK (
    tipo_ocorrencia IN ('entrada', 'saida_almoco', 'retorno_almoco', 'saida', 'dia_inteiro')
  )
);

CREATE INDEX IF NOT EXISTS idx_just_ocorr_justificativa ON justificativa_ocorrencias(justificativa_id);

COMMENT ON TABLE  justificativa_ocorrencias             IS 'Ocorrências selecionadas pelo colaborador ao criar uma justificativa (Entrada, Saída Almoço, etc.).';
COMMENT ON COLUMN justificativa_ocorrencias.tipo_ocorrencia IS 'Tipo: entrada, saida_almoco, retorno_almoco, saida, dia_inteiro.';
COMMENT ON COLUMN justificativa_ocorrencias.horario_correto IS 'Horário correto informado pelo colaborador para aquela ocorrência.';

-- 2. Nova coluna motivo_outros na tabela justificativas
ALTER TABLE justificativas ADD COLUMN IF NOT EXISTS motivo_outros TEXT;

COMMENT ON COLUMN justificativas.motivo_outros IS 'Preenchido quando o tipo de ocorrência selecionado for Outros.';

-- 3. RLS (mesma política deny_all — acesso via service_role)
ALTER TABLE justificativa_ocorrencias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_all_just_ocorr" ON justificativa_ocorrencias AS RESTRICTIVE USING (false);

-- ============================================================
-- FIM DA MIGRAÇÃO
-- ============================================================
