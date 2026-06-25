-- ============================================================
--  Criação do usuário: Vinicius Bernardes
--  Perfil: Gerente
--  Execute no SQL Editor do Supabase
-- ============================================================

INSERT INTO usuarios (
  nome,
  email,
  senha_hash,
  perfil,
  departamento,
  ativo
)
VALUES (
  'Vinicius Bernardes',
  'vinicius.bernardes@f2jsolucoes.com.br',
  '$2b$10$fgH5UJwLF.nNmqfBysFguupHJqRo1skBTgpJC/HDIyiVagW3PJyBu',
  'gerente',
  NULL,
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Confirma a criação
SELECT id, nome, email, perfil, ativo, criado_em
FROM usuarios
WHERE email = 'vinicius.bernardes@f2jsolucoes.com.br';
