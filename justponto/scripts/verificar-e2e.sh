#!/usr/bin/env bash
# ============================================================
# JustPonto — Script de Verificação End-to-End (mock mode)
# ============================================================
set -e
BASE="http://localhost:3000"
PASS=0; FAIL=0

ok() { echo "  ✅ $1"; ((PASS++)); }
fail() { echo "  ❌ $1"; ((FAIL++)); }
section() { echo ""; echo "── $1 ──────────────────────────────────"; }

# ── Helpers ─────────────────────────────────────────────────
login() {
  curl -s -X POST "$BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"senha\":\"$2\"}"
}
get() { curl -s -X GET "$BASE$1" -H "Authorization: Bearer $2"; }
post() { curl -s -X POST "$BASE$1" -H "Authorization: Bearer $2" -H "Content-Type: application/json" -d "$3"; }
patch() { curl -s -X PATCH "$BASE$1" -H "Authorization: Bearer $2" -H "Content-Type: application/json" -d "$3"; }

# ── 1. Login de todos os perfis ─────────────────────────────
section "Tarefa 4 — Autenticação"

COLAB_TOKEN=$(login "colaborador@empresa.com" "senha123" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
[ -n "$COLAB_TOKEN" ] && ok "Login colaborador retornou token JWT" || fail "Login colaborador falhou"

GER_TOKEN=$(login "gerente@empresa.com" "senha123" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
[ -n "$GER_TOKEN" ] && ok "Login gerente retornou token JWT" || fail "Login gerente falhou"

RH_TOKEN=$(login "rh@empresa.com" "senha123" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
[ -n "$RH_TOKEN" ] && ok "Login RH retornou token JWT" || fail "Login RH falhou"

DIR_TOKEN=$(login "direcao@empresa.com" "senha123" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
[ -n "$DIR_TOKEN" ] && ok "Login Direção retornou token JWT" || fail "Login Direção falhou"

# Rota sem token → 401
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/tipos-ocorrencia")
[ "$STATUS" = "401" ] && ok "Rota sem token retorna 401" || fail "Rota sem token deveria retornar 401 (got $STATUS)"

# Rota com credenciais inválidas → 401
STATUS=$(login "x@x.com" "errada" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('statusCode',''))")
[ "$STATUS" = "401" ] && ok "Credenciais inválidas retornam 401" || fail "Credenciais inválidas deveria ser 401"

# ── 2. Tipos de ocorrência ───────────────────────────────────
section "Tarefa 5 — Tipos de Ocorrência"

TIPOS=$(get "/tipos-ocorrencia" "$COLAB_TOKEN")
COUNT=$(echo "$TIPOS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
[ "$COUNT" = "8" ] && ok "Lista 8 tipos de ocorrência (colaborador autenticado)" || fail "Deveria listar 8 tipos (listou $COUNT)"

# Colaborador não pode criar tipo → 403
STATUS=$(post "/tipos-ocorrencia" "$COLAB_TOKEN" '{"nome":"Teste","exigeAnexo":false}' | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('statusCode',''))")
[ "$STATUS" = "403" ] && ok "Colaborador bloqueado de criar tipo (403)" || fail "Colaborador deveria ser bloqueado (got $STATUS)"

# RH pode criar tipo
NOVO_TIPO=$(post "/tipos-ocorrencia" "$RH_TOKEN" '{"nome":"Tipo Teste","descricao":"Desc teste","exigeAnexo":false}')
NOVO_ID=$(echo "$NOVO_TIPO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
[ -n "$NOVO_ID" ] && ok "RH criou novo tipo de ocorrência (id: ${NOVO_ID:0:8}...)" || fail "RH falhou ao criar tipo"

# ── 3. Justificativas — visibilidade por perfil ──────────────
section "Tarefa 6 — Justificativas (Núcleo)"

# Colaborador vê as próprias
MINHAS=$(get "/justificativas/minhas" "$COLAB_TOKEN")
QTD=$(echo "$MINHAS" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
[ "$QTD" = "2" ] && ok "Colaborador vê 2 justificativas próprias (RN-04)" || fail "Deveria ver 2 justificativas (viu $QTD)"

# Colaborador NÃO acessa rota /justificativas (RH/Direção)
STATUS=$(get "/justificativas" "$COLAB_TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('statusCode','ok'))")
[ "$STATUS" = "403" ] && ok "Colaborador bloqueado em GET /justificativas (RN-04)" || fail "Colaborador deveria ser bloqueado (got $STATUS)"

# Gerente vê pendentes da equipe
PENDENTES=$(get "/justificativas/pendentes" "$GER_TOKEN")
QTD_PEND=$(echo "$PENDENTES" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
[ "$QTD_PEND" = "1" ] && ok "Gerente vê 1 pendente da equipe (RN-04)" || fail "Gerente deveria ver 1 pendente (viu $QTD_PEND)"

# Busca o ID da justificativa pendente
JUST_ID=$(echo "$PENDENTES" | python3 -c "import sys,json; lst=json.load(sys.stdin); print(lst[0]['id'] if lst else '')")

# RH vê todas (aprovadas e reprovadas)
TODAS_RH=$(get "/justificativas" "$RH_TOKEN")
QTD_RH=$(echo "$TODAS_RH" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
[ "$QTD_RH" = "2" ] && ok "RH vê todas as justificativas (RN-04)" || fail "RH deveria ver 2 (viu $QTD_RH)"

# Direção vê todas
TODAS_DIR=$(get "/justificativas" "$DIR_TOKEN")
QTD_DIR=$(echo "$TODAS_DIR" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
[ "$QTD_DIR" = "2" ] && ok "Direção vê todas as justificativas (RN-04)" || fail "Direção deveria ver 2 (viu $QTD_DIR)"

# Criar justificativa como colaborador
TIPOS_LIST=$(get "/tipos-ocorrencia" "$COLAB_TOKEN")
TIPO_ID=$(echo "$TIPOS_LIST" | python3 -c "import sys,json; lst=json.load(sys.stdin); print(next(t['id'] for t in lst if not t['exigeAnexo']))")
NOVA=$(post "/justificativas" "$COLAB_TOKEN" "{\"tipoOcorrenciaId\":\"$TIPO_ID\",\"dataOcorrencia\":\"2024-07-01\",\"descricao\":\"Teste criação nova justificativa\"}")
NOVA_ID=$(echo "$NOVA" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
[ -n "$NOVA_ID" ] && ok "Colaborador criou nova justificativa (RN-01 — status pendente)" || fail "Falha ao criar justificativa"

# Verifica que status é pendente (RN-01)
STATUS_NOVA=$(echo "$NOVA" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
[ "$STATUS_NOVA" = "pendente" ] && ok "Nova justificativa nasce como 'pendente' (RN-01)" || fail "Status deveria ser pendente (foi $STATUS_NOVA)"

# Gerente avalia justificativa (RN-02, RN-05)
if [ -n "$JUST_ID" ]; then
  AVALIADA=$(patch "/justificativas/$JUST_ID/avaliar" "$GER_TOKEN" '{"status":"aprovada","comentario":"Aprovado pelo gerente via teste"}')
  STATUS_AVAL=$(echo "$AVALIADA" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  [ "$STATUS_AVAL" = "aprovada" ] && ok "Gerente aprovou justificativa (RN-02, RN-05)" || fail "Aprovação falhou (status: $STATUS_AVAL)"

  # RN-06: não pode reavaliar
  REAVAL=$(patch "/justificativas/$JUST_ID/avaliar" "$GER_TOKEN" '{"status":"reprovada"}')
  REAVAL_CODE=$(echo "$REAVAL" | python3 -c "import sys,json; print(json.load(sys.stdin).get('statusCode',''))")
  [ "$REAVAL_CODE" = "400" ] && ok "Reavaliação bloqueada com 400 (RN-06)" || fail "Deveria bloquear reavaliação (got $REAVAL_CODE)"
fi

# RN-03: tipo que exige anexo sem enviar → 400
TIPO_COM_ANEXO=$(echo "$TIPOS_LIST" | python3 -c "import sys,json; lst=json.load(sys.stdin); print(next(t['id'] for t in lst if t['exigeAnexo']))")
SEM_ANEXO=$(post "/justificativas" "$COLAB_TOKEN" "{\"tipoOcorrenciaId\":\"$TIPO_COM_ANEXO\",\"dataOcorrencia\":\"2024-07-02\",\"descricao\":\"Atestado sem comprovante\"}")
SEM_ANEXO_CODE=$(echo "$SEM_ANEXO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('statusCode',''))")
[ "$SEM_ANEXO_CODE" = "400" ] && ok "Tipo com exige_anexo sem arquivo retorna 400 (RN-03)" || fail "Deveria retornar 400 (got $SEM_ANEXO_CODE)"

# ── 4. Relatórios ────────────────────────────────────────────
section "Tarefa 9 — Relatórios da Direção"

RESUMO=$(get "/relatorios/resumo" "$DIR_TOKEN")
TOTAL=$(echo "$RESUMO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalGeral',''))")
[ "$TOTAL" -gt "0" ] 2>/dev/null && ok "Relatório retorna totalGeral=$TOTAL" || fail "Relatório deveria ter totalGeral > 0"

# Colaborador não acessa relatórios → 403
STATUS_REL=$(get "/relatorios/resumo" "$COLAB_TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('statusCode',''))")
[ "$STATUS_REL" = "403" ] && ok "Colaborador bloqueado em /relatorios/resumo (403)" || fail "Deveria ser 403 (got $STATUS_REL)"

# ── Resultado final ──────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo "  Resultado: $PASS ✅ passou  |  $FAIL ❌ falhou"
echo "════════════════════════════════════════════════"
[ "$FAIL" = "0" ] && echo "  🎉 Todos os testes passaram!" || echo "  ⚠️  Há falhas para corrigir."
echo ""
