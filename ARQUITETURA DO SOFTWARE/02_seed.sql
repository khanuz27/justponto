-- =====================================================================
-- JustPonto — Script 02: SEED (dados iniciais)
-- Rode DEPOIS do 01_schema.sql.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TIPOS DE OCORRÊNCIA (motivos que aparecem na lista de seleção do popup)
-- ---------------------------------------------------------------------
insert into tipos_ocorrencia (nome, descricao, exige_anexo) values
  ('Atestado médico',         'Ausência justificada por atestado médico',            true),
  ('Consulta médica',         'Consulta ou exame agendado',                          true),
  ('Problema de transporte',  'Greve, acidente ou falha no transporte público',      false),
  ('Esquecimento de registro','Compareceu mas esqueceu de registrar o ponto',        false),
  ('Falha no relógio de ponto','Equipamento indisponível ou com defeito',            false),
  ('Trabalho externo',        'Atividade externa previamente autorizada',            false),
  ('Licença / Folga',         'Folga ou licença acordada com a gestão',              false),
  ('Outros',                  'Outros motivos (detalhar no campo justificativa)',    false)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- USUÁRIOS DE EXEMPLO
-- ATENÇÃO: senha_hash abaixo é um PLACEHOLDER. Gere o hash real com bcrypt
-- no NestJS (ex.: script `npm run seed`) — não cadastre senha em texto puro.
-- O hash de exemplo corresponde à senha "senha123" (custo 10). Troque em produção.
-- ---------------------------------------------------------------------
-- Hash bcrypt de "senha123": $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
with novos as (
  select * from (values
    ('Direção Geral',  'direcao@empresa.com',  'direcao'::perfil_usuario,    null::text),
    ('RH Central',     'rh@empresa.com',       'rh'::perfil_usuario,         null),
    ('João Gerente',   'gerente@empresa.com',  'gerente'::perfil_usuario,    null),
    ('Maria Colab',    'colaborador@empresa.com','colaborador'::perfil_usuario, 'gerente@empresa.com')
  ) as t(nome, email, perfil, email_gerente)
)
insert into usuarios (nome, email, senha_hash, perfil, gerente_id)
select
  n.nome,
  n.email,
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  n.perfil,
  (select id from usuarios g where g.email = n.email_gerente)
from novos n
on conflict (email) do nothing;
