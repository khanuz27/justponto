-- =====================================================================
-- JustPonto — Sistema de Justificativas de Não Registro de Ponto
-- Script 01: SCHEMA (DDL)
-- Banco: PostgreSQL (Supabase)
-- Rode este script APÓS validar a aplicação com dados mockados.
-- =====================================================================

-- Extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'perfil_usuario') then
    create type perfil_usuario as enum ('colaborador', 'gerente', 'rh', 'direcao');
  end if;
  if not exists (select 1 from pg_type where typname = 'status_justificativa') then
    create type status_justificativa as enum ('pendente', 'aprovada', 'reprovada');
  end if;
  if not exists (select 1 from pg_type where typname = 'periodo_ocorrencia') then
    create type periodo_ocorrencia as enum ('dia_inteiro', 'parcial');
  end if;
end $$;

-- ---------------------------------------------------------------------
-- USUÁRIOS
-- senha_hash deve ser gerada via bcrypt no backend (NestJS), nunca em texto puro.
-- gerente_id é auto-referência: aponta para o gerente responsável pelo colaborador.
-- ---------------------------------------------------------------------
create table if not exists usuarios (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  email        text not null unique,
  senha_hash   text not null,
  perfil       perfil_usuario not null default 'colaborador',
  gerente_id   uuid references usuarios(id),
  departamento text,
  ativo        boolean not null default true,
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TIPOS DE OCORRÊNCIA (motivos pré-cadastrados)
-- ---------------------------------------------------------------------
create table if not exists tipos_ocorrencia (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  descricao   text,
  exige_anexo boolean not null default false,
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- JUSTIFICATIVAS
-- periodo / hora_inicio / hora_fim sustentam o relatório de "horas justificadas" da Direção.
-- ---------------------------------------------------------------------
create table if not exists justificativas (
  id                  uuid primary key default gen_random_uuid(),
  colaborador_id      uuid not null references usuarios(id),
  tipo_ocorrencia_id  uuid not null references tipos_ocorrencia(id),
  data_ocorrencia     date not null,
  periodo             periodo_ocorrencia not null default 'dia_inteiro',
  hora_inicio         time,
  hora_fim            time,
  descricao           text not null,
  status              status_justificativa not null default 'pendente',
  aprovador_id        uuid references usuarios(id),
  comentario_avaliacao text,
  avaliado_em         timestamptz,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ANEXOS (comprovantes — arquivo físico vai para o Supabase Storage)
-- caminho_storage guarda apenas o path do objeto no bucket.
-- ---------------------------------------------------------------------
create table if not exists anexos (
  id               uuid primary key default gen_random_uuid(),
  justificativa_id uuid not null references justificativas(id) on delete cascade,
  nome_arquivo     text not null,
  caminho_storage  text not null,
  tipo_mime        text,
  tamanho_bytes    bigint,
  criado_em        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- HISTÓRICO DE STATUS (trilha de auditoria — alimenta relatórios da Direção)
-- ---------------------------------------------------------------------
create table if not exists justificativa_historico (
  id               uuid primary key default gen_random_uuid(),
  justificativa_id uuid not null references justificativas(id) on delete cascade,
  status_anterior  status_justificativa,
  status_novo      status_justificativa not null,
  alterado_por     uuid references usuarios(id),
  comentario       text,
  criado_em        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- NOTIFICAÇÕES (log de e-mails disparados aos gerentes)
-- ---------------------------------------------------------------------
create table if not exists notificacoes (
  id               uuid primary key default gen_random_uuid(),
  justificativa_id uuid references justificativas(id) on delete cascade,
  destinatario_id  uuid references usuarios(id),
  canal            text not null default 'email',
  assunto          text,
  enviado_em       timestamptz,
  status_envio     text not null default 'pendente', -- pendente | enviado | falha
  erro             text,
  criado_em        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------------------
create index if not exists idx_justificativas_colaborador on justificativas(colaborador_id);
create index if not exists idx_justificativas_status      on justificativas(status);
create index if not exists idx_justificativas_data        on justificativas(data_ocorrencia);
create index if not exists idx_anexos_justificativa       on anexos(justificativa_id);
create index if not exists idx_historico_justificativa    on justificativa_historico(justificativa_id);
create index if not exists idx_usuarios_perfil            on usuarios(perfil);
create index if not exists idx_usuarios_gerente           on usuarios(gerente_id);

-- ---------------------------------------------------------------------
-- TRIGGER: atualizar atualizado_em automaticamente
-- ---------------------------------------------------------------------
create or replace function set_atualizado_em()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_usuarios_updated on usuarios;
create trigger trg_usuarios_updated
  before update on usuarios
  for each row execute function set_atualizado_em();

drop trigger if exists trg_justificativas_updated on justificativas;
create trigger trg_justificativas_updated
  before update on justificativas
  for each row execute function set_atualizado_em();

-- =====================================================================
-- RLS (Row Level Security) — OPCIONAL
-- Se o NestJS acessar o banco com a SERVICE ROLE, ele ignora RLS e a
-- autorização é feita pelos Guards do Nest. Habilite as policies abaixo
-- apenas se for consultar o banco direto do frontend com a anon key.
-- =====================================================================
-- alter table justificativas enable row level security;
-- create policy "colaborador_ve_suas_justificativas"
--   on justificativas for select
--   using (colaborador_id = auth.uid());
