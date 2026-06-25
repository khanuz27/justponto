-- ============================================================
--  JustPonto — Script de criação do banco de dados
--  Compatível com: PostgreSQL 15+ / Supabase
--  Executar uma única vez no banco de produção/staging
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Extensões
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- crypt() / gen_salt()

-- ─────────────────────────────────────────────────────────────
-- 1. Tipos enumerados (ENUM)
-- ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE perfil_usuario AS ENUM ('colaborador', 'gerente', 'rh', 'direcao');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_justificativa AS ENUM ('pendente', 'aprovada', 'reprovada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE periodo_tipo AS ENUM ('dia_inteiro', 'parcial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_envio_email AS ENUM ('pendente', 'enviado', 'falha');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. Tabelas (ordem: sem dependências → com dependências)
-- ─────────────────────────────────────────────────────────────

-- 2.1 Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          TEXT          NOT NULL,
  email         TEXT          NOT NULL UNIQUE,
  senha_hash    TEXT          NOT NULL,
  perfil        perfil_usuario NOT NULL DEFAULT 'colaborador',
  gerente_id    UUID          REFERENCES usuarios(id) ON DELETE SET NULL,
  departamento  TEXT,
  ativo         BOOLEAN       NOT NULL DEFAULT TRUE,
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  usuarios              IS 'Todos os usuários do sistema (colaboradores, gerentes, RH, direção).';
COMMENT ON COLUMN usuarios.senha_hash   IS 'Hash bcrypt gerado com custo 10.';
COMMENT ON COLUMN usuarios.gerente_id   IS 'Apenas colaboradores possuem referência ao gerente responsável.';
COMMENT ON COLUMN usuarios.ativo        IS 'FALSE bloqueia o login do usuário.';

-- 2.2 Tipos de ocorrência
CREATE TABLE IF NOT EXISTS tipos_ocorrencia (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT        NOT NULL UNIQUE,
  descricao    TEXT,
  exige_anexo  BOOLEAN     NOT NULL DEFAULT FALSE,
  ativo        BOOLEAN     NOT NULL DEFAULT TRUE,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  tipos_ocorrencia              IS 'Catálogo de motivos de justificativa (atestado, transporte, etc.).';
COMMENT ON COLUMN tipos_ocorrencia.exige_anexo  IS 'Se TRUE, o colaborador deve enviar comprovante ao criar a justificativa.';

-- 2.3 Justificativas
CREATE TABLE IF NOT EXISTS justificativas (
  id                    UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id        UUID                 NOT NULL REFERENCES usuarios(id)        ON DELETE CASCADE,
  tipo_ocorrencia_id    UUID                 NOT NULL REFERENCES tipos_ocorrencia(id) ON DELETE RESTRICT,
  data_ocorrencia       DATE                 NOT NULL,
  periodo               periodo_tipo         NOT NULL DEFAULT 'dia_inteiro',
  hora_inicio           TIME,                -- preenchido apenas quando periodo = 'parcial'
  hora_fim              TIME,                -- preenchido apenas quando periodo = 'parcial'
  descricao             TEXT                 NOT NULL,
  status                status_justificativa NOT NULL DEFAULT 'pendente',
  aprovador_id          UUID                 REFERENCES usuarios(id) ON DELETE SET NULL,
  comentario_avaliacao  TEXT,
  avaliado_em           TIMESTAMPTZ,
  ajuste_lancado        BOOLEAN              NOT NULL DEFAULT FALSE,
  criado_em             TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
  atualizado_em         TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_periodo_parcial CHECK (
    periodo = 'dia_inteiro' OR (hora_inicio IS NOT NULL AND hora_fim IS NOT NULL)
  ),
  CONSTRAINT chk_horas CHECK (
    hora_inicio IS NULL OR hora_fim IS NULL OR hora_inicio < hora_fim
  )
);

COMMENT ON TABLE  justificativas                    IS 'Justificativas de ausência ou não registro de ponto.';
COMMENT ON COLUMN justificativas.ajuste_lancado     IS 'Marcado pelo RH após lançar o ajuste no sistema de ponto.';

-- 2.4 Anexos
CREATE TABLE IF NOT EXISTS anexos (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  justificativa_id UUID        NOT NULL REFERENCES justificativas(id) ON DELETE CASCADE,
  nome_arquivo     TEXT        NOT NULL,
  caminho_storage  TEXT        NOT NULL,   -- path no bucket Supabase Storage
  tipo_mime        TEXT,
  tamanho_bytes    INTEGER,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  anexos                  IS 'Arquivos comprobatórios vinculados às justificativas.';
COMMENT ON COLUMN anexos.caminho_storage  IS 'Caminho completo dentro do bucket (ex: justificativas/{id}/arquivo.pdf).';

-- 2.5 Histórico de status das justificativas
CREATE TABLE IF NOT EXISTS justificativas_historico (
  id               UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
  justificativa_id UUID                 NOT NULL REFERENCES justificativas(id) ON DELETE CASCADE,
  status_anterior  status_justificativa,
  status_novo      status_justificativa NOT NULL,
  alterado_por_id  UUID                 REFERENCES usuarios(id) ON DELETE SET NULL,
  comentario       TEXT,
  criado_em        TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE justificativas_historico IS 'Auditoria de todas as mudanças de status de cada justificativa.';

-- 2.6 Notificações por e-mail
CREATE TABLE IF NOT EXISTS notificacoes (
  id               UUID                 PRIMARY KEY DEFAULT uuid_generate_v4(),
  justificativa_id UUID                 REFERENCES justificativas(id) ON DELETE SET NULL,
  destinatario_id  UUID                 REFERENCES usuarios(id)       ON DELETE SET NULL,
  canal            TEXT                 NOT NULL DEFAULT 'email',
  assunto          TEXT,
  enviado_em       TIMESTAMPTZ,
  status_envio     status_envio_email   NOT NULL DEFAULT 'pendente',
  erro             TEXT,
  criado_em        TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notificacoes IS 'Registro de notificações enviadas (ou com falha) para gerentes e colaboradores.';

-- ─────────────────────────────────────────────────────────────
-- 3. Índices para performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_usuarios_email         ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_perfil        ON usuarios(perfil);
CREATE INDEX IF NOT EXISTS idx_usuarios_gerente_id    ON usuarios(gerente_id);

CREATE INDEX IF NOT EXISTS idx_justificativas_colaborador  ON justificativas(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_justificativas_status       ON justificativas(status);
CREATE INDEX IF NOT EXISTS idx_justificativas_data         ON justificativas(data_ocorrencia);
CREATE INDEX IF NOT EXISTS idx_justificativas_tipo         ON justificativas(tipo_ocorrencia_id);
-- índice composto: consultas do gerente (pendentes da equipe)
CREATE INDEX IF NOT EXISTS idx_justificativas_colab_status ON justificativas(colaborador_id, status);

CREATE INDEX IF NOT EXISTS idx_anexos_justificativa        ON anexos(justificativa_id);
CREATE INDEX IF NOT EXISTS idx_historico_justificativa     ON justificativas_historico(justificativa_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_destinatario   ON notificacoes(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_status         ON notificacoes(status_envio);

-- ─────────────────────────────────────────────────────────────
-- 4. Trigger: atualizado_em automático
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_usuarios_atualizado_em        ON usuarios;
DROP TRIGGER IF EXISTS trg_justificativas_atualizado_em  ON justificativas;

CREATE TRIGGER trg_usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

CREATE TRIGGER trg_justificativas_atualizado_em
  BEFORE UPDATE ON justificativas
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ─────────────────────────────────────────────────────────────
-- 5. Row Level Security (Supabase)
--    A API NestJS acessa via service_role_key (bypassa RLS).
--    RLS protege acessos diretos ao banco (ex: dashboard Supabase).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE usuarios               ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_ocorrencia       ENABLE ROW LEVEL SECURITY;
ALTER TABLE justificativas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE anexos                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE justificativas_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes           ENABLE ROW LEVEL SECURITY;

-- Política padrão: negar tudo (a NestJS usa service_role que bypassa RLS)
-- Ajuste estas políticas se for usar o cliente JS do Supabase diretamente.
CREATE POLICY "deny_all_usuarios"     ON usuarios               AS RESTRICTIVE USING (false);
CREATE POLICY "deny_all_tipos"        ON tipos_ocorrencia       AS RESTRICTIVE USING (false);
CREATE POLICY "deny_all_just"         ON justificativas         AS RESTRICTIVE USING (false);
CREATE POLICY "deny_all_anexos"       ON anexos                 AS RESTRICTIVE USING (false);
CREATE POLICY "deny_all_historico"    ON justificativas_historico AS RESTRICTIVE USING (false);
CREATE POLICY "deny_all_notificacoes" ON notificacoes           AS RESTRICTIVE USING (false);

-- ─────────────────────────────────────────────────────────────
-- 6. Bucket Supabase Storage
--    Execute no dashboard ou via API Management do Supabase.
--    Não é SQL padrão — é apenas documentação do que criar.
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('anexos', 'anexos', false);
-- O bucket deve ser PRIVADO. URLs são geradas com signed URLs (TTL 1h).

-- ─────────────────────────────────────────────────────────────
-- 7. Dados iniciais (seed de produção)
--    Senha padrão: "senha123" (bcrypt custo 10)
--    TROQUE as senhas imediatamente após o primeiro login!
-- ─────────────────────────────────────────────────────────────
INSERT INTO tipos_ocorrencia (nome, descricao, exige_anexo, ativo) VALUES
  ('Atestado médico',          'Ausência justificada por atestado médico',              TRUE,  TRUE),
  ('Consulta médica',          'Consulta ou exame agendado',                            TRUE,  TRUE),
  ('Problema de transporte',   'Greve, acidente ou falha no transporte público',        FALSE, TRUE),
  ('Esquecimento de registro', 'Compareceu mas esqueceu de registrar o ponto',          FALSE, TRUE),
  ('Falha no relógio de ponto','Equipamento indisponível ou com defeito',               FALSE, TRUE),
  ('Trabalho externo',         'Atividade externa previamente autorizada',              FALSE, TRUE),
  ('Licença / Folga',          'Folga ou licença acordada com a gestão',               FALSE, TRUE),
  ('Outros',                   'Outros motivos (detalhar no campo justificativa)',      FALSE, TRUE)
ON CONFLICT (nome) DO NOTHING;

-- Usuários padrão de sistema
-- Hash de "senha123" com bcrypt custo 10
INSERT INTO usuarios (nome, email, senha_hash, perfil, departamento, ativo) VALUES
  ('Direção Geral', 'direcao@empresa.com',    '$2b$10$d8V.sdplbhfSqIN2fDGevubnqKIs/IuASdm22/G//8fgE8T21szda', 'direcao',    'Diretoria',        TRUE),
  ('RH Central',    'rh@empresa.com',         '$2b$10$d8V.sdplbhfSqIN2fDGevubnqKIs/IuASdm22/G//8fgE8T21szda', 'rh',         'Recursos Humanos',  TRUE),
  ('João Gerente',  'gerente@empresa.com',    '$2b$10$d8V.sdplbhfSqIN2fDGevubnqKIs/IuASdm22/G//8fgE8T21szda', 'gerente',    'TI',               TRUE)
ON CONFLICT (email) DO NOTHING;

-- Colaborador vinculado ao gerente (insert separado para referenciar o gerente pelo email)
INSERT INTO usuarios (nome, email, senha_hash, perfil, gerente_id, departamento, ativo)
SELECT
  'Maria Colab',
  'colaborador@empresa.com',
  '$2b$10$d8V.sdplbhfSqIN2fDGevubnqKIs/IuASdm22/G//8fgE8T21szda',
  'colaborador',
  u.id,
  'TI',
  TRUE
FROM usuarios u WHERE u.email = 'gerente@empresa.com'
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 8. View útil: visão consolidada para relatórios
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_justificativas_completa AS
SELECT
  j.id,
  j.data_ocorrencia,
  j.periodo,
  j.hora_inicio,
  j.hora_fim,
  j.descricao,
  j.status,
  j.comentario_avaliacao,
  j.avaliado_em,
  j.ajuste_lancado,
  j.criado_em,
  j.atualizado_em,
  -- Colaborador
  c.id            AS colaborador_id,
  c.nome          AS colaborador_nome,
  c.email         AS colaborador_email,
  c.departamento  AS colaborador_departamento,
  -- Tipo de ocorrência
  t.id            AS tipo_id,
  t.nome          AS tipo_nome,
  t.exige_anexo,
  -- Aprovador
  a.nome          AS aprovador_nome,
  -- Contagem de anexos
  (SELECT COUNT(*) FROM anexos WHERE justificativa_id = j.id) AS qtd_anexos
FROM justificativas j
JOIN usuarios       c ON c.id = j.colaborador_id
JOIN tipos_ocorrencia t ON t.id = j.tipo_ocorrencia_id
LEFT JOIN usuarios  a ON a.id = j.aprovador_id;

COMMENT ON VIEW vw_justificativas_completa IS 'View denormalizada para relatórios e dashboards.';

-- ─────────────────────────────────────────────────────────────
-- FIM DO SCRIPT
-- ─────────────────────────────────────────────────────────────
