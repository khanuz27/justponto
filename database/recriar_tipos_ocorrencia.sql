-- ============================================================
--  Recriação dos tipos de ocorrência
--  Execute no SQL Editor do Supabase
--  ATENÇÃO: apaga todos os tipos existentes e recria
-- ============================================================

-- 1. Remove todos os tipos atuais
--    (justificativas vinculadas terão tipo_ocorrencia_id zerado → NULL)
UPDATE justificativas SET tipo_ocorrencia_id = NULL WHERE tipo_ocorrencia_id IS NOT NULL;
DELETE FROM tipos_ocorrencia;

-- 2. Insere apenas os tipos solicitados
INSERT INTO tipos_ocorrencia (nome, descricao, exige_anexo, ativo) VALUES
  ('Atraso',                      'Chegada após o horário previsto de entrada.',          FALSE, TRUE),
  ('Falta',                       'Ausência não justificada ou justificada no dia.',       TRUE,  TRUE),
  ('Problemas no relógio do ponto','Falha ou mau funcionamento no equipamento de ponto.', FALSE, TRUE),
  ('Esquecimento de batida',      'Colaborador esqueceu de registrar uma das batidas.',   FALSE, TRUE),
  ('Abertura tarde da empresa',   'Empresa abriu com atraso impedindo o registro normal.',FALSE, TRUE);

-- 3. Confirma os tipos criados
SELECT id, nome, exige_anexo, ativo FROM tipos_ocorrencia ORDER BY nome;
