#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Test automatizado para el chatbot Lunita
# Llama al API /api/chat con escenarios reales y valida respuestas
# Uso: bash test-chat.sh
# ═══════════════════════════════════════════════════════════════

BASE_URL="http://localhost:8080/api"
PASS=0
FAIL=0
TOTAL=0

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ── Obtener productos de la BD ──
echo -e "${YELLOW}📦 Obteniendo productos de la BD...${NC}"
PRODUCTS_JSON=$(curl -s "$BASE_URL/products")
if [ -z "$PRODUCTS_JSON" ] || [ "$PRODUCTS_JSON" = "[]" ]; then
    echo -e "${RED}❌ No se pudieron obtener productos. ¿El backend está corriendo?${NC}"
    exit 1
fi

# Construir businessContext con productos reales de la BD
BUSINESS_CONTEXT=$(echo "$PRODUCTS_JSON" | python3 -c "
import sys, json
products = json.load(sys.stdin)
mapped = []
for p in products:
    mapped.append({
        'name': p.get('name'),
        'category': p.get('category'),
        'price': p.get('price'),
        'rentalPricePerDay': p.get('rentalPricePerDay'),
        'productType': p.get('productType'),
        'priceTiers': p.get('priceTiers', []),
        'quarterPriceTiers': p.get('quarterPriceTiers', [])
    })
ctx = {'products': mapped, 'cart': []}
print(json.dumps(ctx))
")

BUSINESS_CONTEXT_WITH_CART=$(echo "$PRODUCTS_JSON" | python3 -c "
import sys, json
products = json.load(sys.stdin)
mapped = []
for p in products:
    mapped.append({
        'name': p.get('name'),
        'category': p.get('category'),
        'price': p.get('price'),
        'rentalPricePerDay': p.get('rentalPricePerDay'),
        'productType': p.get('productType'),
        'priceTiers': p.get('priceTiers', []),
        'quarterPriceTiers': p.get('quarterPriceTiers', [])
    })
ctx = {
    'products': mapped,
    'cart': [
        {'name': 'Papas Preparadas (Bowl)', 'quantity': 1, 'price': 4250},
        {'name': 'tablon sillas', 'quantity': 5, 'price': 200}
    ]
}
print(json.dumps(ctx))
")

echo -e "${YELLOW}🧪 Iniciando tests...${NC}\n"

# ── Helper: envia mensaje y retorna respuesta ──
send_chat() {
    local message="$1"
    local context="$2"
    local biz_ctx="$3"
    
    [ -z "$context" ] && context="[]"
    [ -z "$biz_ctx" ] && biz_ctx="$BUSINESS_CONTEXT"
    
    local payload=$(python3 -c "
import json, sys
msg = sys.argv[1]
ctx = json.loads(sys.argv[2])
biz = json.loads(sys.argv[3])
print(json.dumps({'message': msg, 'context': ctx, 'businessContext': biz}))
" "$message" "$context" "$biz_ctx")
    
    curl -s -X POST "$BASE_URL/chat" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>/dev/null
}

# ── Helper: valida respuesta ──
assert_contains() {
    local test_name="$1"
    local response="$2"
    local expected="$3"
    TOTAL=$((TOTAL + 1))
    
    if echo "$response" | grep -qi "$expected"; then
        echo -e "  ${GREEN}✅ PASS${NC}: $test_name"
        PASS=$((PASS + 1))
    else
        echo -e "  ${RED}❌ FAIL${NC}: $test_name"
        echo -e "     Esperaba contener: '$expected'"
        echo -e "     Respuesta: $(echo "$response" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('message','')[:200])" 2>/dev/null || echo "$response" | head -c 200)"
        FAIL=$((FAIL + 1))
    fi
}

assert_not_contains() {
    local test_name="$1"
    local response="$2"
    local forbidden="$3"
    TOTAL=$((TOTAL + 1))
    
    if echo "$response" | grep -qi "$forbidden"; then
        echo -e "  ${RED}❌ FAIL${NC}: $test_name"
        echo -e "     NO debería contener: '$forbidden'"
        echo -e "     Respuesta: $(echo "$response" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d.get('message','')[:200])" 2>/dev/null || echo "$response" | head -c 200)"
        FAIL=$((FAIL + 1))
    else
        echo -e "  ${GREEN}✅ PASS${NC}: $test_name"
        PASS=$((PASS + 1))
    fi
}

# ═══════════════════════════════════════════════════════════════
# TEST 1: Precios Bowl para 50 personas
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 1: Precios Bowl 50 personas ═══${NC}"

# Paso 1: Pedir papas
RESP1=$(send_chat "quiero papas preparadas")
assert_contains "Pregunta cuántas personas" "$RESP1" "personas"

# Paso 2: Decir 50 personas (con contexto de conversación)
CONTEXT_50='[{"role":"user","content":"quiero papas preparadas"},{"role":"assistant","content":"¿Para cuántas personas? (mínimo 30)"}]'
RESP2=$(send_chat "para 50 personas" "$CONTEXT_50")

assert_contains "Bowl 1/4 = \$3250 para 50p" "$RESP2" "3.250\|3,250\|3250"
assert_contains "Bowl 1/2 = \$4250 para 50p" "$RESP2" "4.250\|4,250\|4250"
assert_not_contains "No muestra precio incorrecto \$5600" "$RESP2" "5.600\|5,600\|5600"
assert_not_contains "No muestra precio incorrecto \$6300" "$RESP2" "6.300\|6,300\|6300"

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 2: Precios Bowl para 100 personas
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 2: Precios Bowl 100 personas ═══${NC}"

CONTEXT_100='[{"role":"user","content":"quiero papas preparadas"},{"role":"assistant","content":"¿Para cuántas personas? (mínimo 30)"}]'
RESP3=$(send_chat "para 100 personas" "$CONTEXT_100")

assert_contains "Bowl 1/4 = \$5500 para 100p" "$RESP3" "5.500\|5,500\|5500"
assert_contains "Bowl 1/2 = \$6800 para 100p" "$RESP3" "6.800\|6,800\|6800"
assert_not_contains "No muestra precio inventado \$4800" "$RESP3" "4.800\|4,800\|4800"
assert_not_contains "No muestra precio inventado \$8160" "$RESP3" "8.160\|8,160\|8160"

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 3: No mencionar carrito (anti-recap)
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 3: Anti-recap (no mencionar carrito) ═══${NC}"

# Pedir tablones cuando ya hay papas en el carrito
CONTEXT_TABLON='[{"role":"user","content":"quiero 5 tablones"},{"role":"assistant","content":"¡Claro! ¿Los quieres solos, con sillas o con sillas y mantel?"},{"role":"user","content":"con sillas"}]'
RESP4=$(send_chat "y también quiero 3 mesas redondas" "$CONTEXT_TABLON" "$BUSINESS_CONTEXT_WITH_CART")

assert_not_contains "No dice 'recuerda'" "$RESP4" "recuerda"
assert_not_contains "No dice 'ya tenías'" "$RESP4" "ya ten"
assert_not_contains "No dice 'también tenías'" "$RESP4" "también ten"
assert_not_contains "No menciona Papas del carrito" "$RESP4" "Papas Preparadas"

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 4: Precios Bowl para 30 personas (mínimo)
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 4: Precios Bowl 30 personas (mínimo) ═══${NC}"

CONTEXT_30='[{"role":"user","content":"quiero papas preparadas"},{"role":"assistant","content":"¿Para cuántas personas? (mínimo 30)"}]'
RESP5=$(send_chat "para 30" "$CONTEXT_30")

assert_contains "Bowl 1/4 = \$1950 para 30p" "$RESP5" "1.950\|1,950\|1950"
assert_contains "Bowl 1/2 = \$2550 para 30p" "$RESP5" "2.550\|2,550\|2550"

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 5: Petición con carrito lleno - no resume
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 5: No hace resumen del carrito al pedir nuevo producto ═══${NC}"

CONTEXT_NEW='[{"role":"user","content":"hola quiero ordenar"},{"role":"assistant","content":"¡Hola! ¿Qué te gustaría ordenar? 🌙"}]'
RESP6=$(send_chat "quiero elotes para 40 personas" "$CONTEXT_NEW" "$BUSINESS_CONTEXT_WITH_CART")

assert_not_contains "No menciona contenido del carrito" "$RESP6" "ya tienes\|en tu carrito\|tu pedido actual"
assert_not_contains "No menciona tablones del carrito" "$RESP6" "tablon"
assert_not_contains "No usa 'anteriormente'" "$RESP6" "anteriormente"

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 6: Tablones - espera confirmación al elegir variante
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 6: Tablones espera confirmación antes de agregar ═══${NC}"

CONTEXT_TABLON_VARIANT='[{"role":"user","content":"quiero 5 tablones"},{"role":"assistant","content":"¡Claro! ¿Los quieres solos ($150 c/u), con sillas ($200 c/u) o con sillas y mantel ($220 c/u)?"}]'
RESP7=$(send_chat "con mantel" "$CONTEXT_TABLON_VARIANT")

assert_contains "Pregunta si lo agrega al carrito" "$RESP7" "agrego al carrito"
assert_not_contains "No emite SET_QTY antes de confirmación" "$RESP7" "SET_QTY"
assert_not_contains "No pregunta nombre antes de confirmar" "$RESP7" "nombre"
assert_not_contains "No pregunta WhatsApp antes de confirmar" "$RESP7" "WhatsApp"

echo ""

# ═══════════════════════════════════════════════════════════════
# TEST 7: Elote en Vaso - ofrece combinar con Elote Revolcado
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══ TEST 7: Elotes - combinación correcta ═══${NC}"

CONTEXT_ELOTE='[{"role":"user","content":"quiero elote en vaso"},{"role":"assistant","content":"¡Claro! ¿Para cuántas personas? (mínimo 30)"}]'
RESP8=$(send_chat "para 50 personas" "$CONTEXT_ELOTE")

assert_contains "Ofrece combinar con Elote Revolcado" "$RESP8" "Revolcado"
assert_not_contains "No ofrece Tostielote para combinar" "$RESP8" "Tostielote"

echo ""

# ═══════════════════════════════════════════════════════════════
# RESUMEN
# ═══════════════════════════════════════════════════════════════
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}  RESULTADOS${NC}"
echo -e "${YELLOW}═══════════════════════════════════════${NC}"
echo -e "  Total:  $TOTAL"
echo -e "  ${GREEN}Pass:   $PASS${NC}"
echo -e "  ${RED}Fail:   $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todos los tests pasaron!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $FAIL test(s) fallaron.${NC}"
    exit 1
fi
