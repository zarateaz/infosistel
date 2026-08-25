#!/bin/bash
# ══════════════════════════════════════════════════════════════════════════════
#  scripts/monitor-ddos.sh
#  Monitor de ataques DDoS en tiempo real para INFOSISTEL
#
#  Uso:
#    chmod +x scripts/monitor-ddos.sh
#    sudo ./scripts/monitor-ddos.sh            # monitoreo en vivo (5 min)
#    sudo ./scripts/monitor-ddos.sh --top 20   # mostrar top 20 IPs
#    sudo ./scripts/monitor-ddos.sh --watch    # modo watch (actualiza cada 30s)
#
#  Requiere: nginx, awk, sort, uniq, tail
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

ACCESS_LOG="/var/log/nginx/infosistel_access.log"
ERROR_LOG="/var/log/nginx/infosistel_error.log"
TOP_N=15
WINDOW_MINUTES=5
WATCH_INTERVAL=30

# ── Parse args ────────────────────────────────────────────────────────────────
WATCH_MODE=false
while [[ $# -gt 0 ]]; do
    case "$1" in
        --top)    TOP_N="$2";         shift 2 ;;
        --window) WINDOW_MINUTES="$2"; shift 2 ;;
        --watch)  WATCH_MODE=true;     shift ;;
        *)        shift ;;
    esac
done

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ── Check log file ────────────────────────────────────────────────────────────
if [[ ! -f "$ACCESS_LOG" ]]; then
    echo -e "${RED}✗ Log no encontrado: $ACCESS_LOG${RESET}"
    echo "  Verifica que nginx esté corriendo y el archivo exista."
    exit 1
fi

# ── Main report ───────────────────────────────────────────────────────────────
show_report() {
    local now
    now=$(date '+%Y-%m-%d %H:%M:%S')

    # Cuántas líneas representan los últimos N minutos (aprox. 100 req/s máx)
    # Leemos las últimas 50k líneas para cubrir picos de tráfico
    local log_lines=50000

    clear 2>/dev/null || true

    echo -e "${BOLD}${CYAN}══════════════════════════════════════════════════════${RESET}"
    echo -e "${BOLD}  INFOSISTEL — Monitor Anti-DDoS   ${now}${RESET}"
    echo -e "${CYAN}══════════════════════════════════════════════════════${RESET}"
    echo ""

    # ── Top IPs por total de requests ─────────────────────────────────────────
    echo -e "${BOLD}📊 Top ${TOP_N} IPs (últimas ~${WINDOW_MINUTES} min)${RESET}"
    echo -e "─────────────────────────────────────────────────────"

    local top_ips
    top_ips=$(tail -n "$log_lines" "$ACCESS_LOG" \
        | awk '{print $1}' \
        | sort | uniq -c | sort -rn \
        | head -n "$TOP_N")

    if [[ -z "$top_ips" ]]; then
        echo -e "  ${GREEN}Sin tráfico reciente.${RESET}"
    else
        echo "$top_ips" | while read -r count ip; do
            local bar=""
            local color="$GREEN"
            if   [[ "$count" -gt 500 ]]; then color="$RED";    bar="🔴 ATAQUE";
            elif [[ "$count" -gt 200 ]]; then color="$RED";    bar="🔴 ALTO";
            elif [[ "$count" -gt 100 ]]; then color="$YELLOW"; bar="🟡 SOSPECHOSO";
            elif [[ "$count" -gt  50 ]]; then color="$YELLOW"; bar="🟡 ELEVADO";
            else color="$GREEN"; bar="🟢 Normal";
            fi
            printf "${color}  %-6s  %-18s  %s${RESET}\n" "$count" "$ip" "$bar"
        done
    fi

    echo ""

    # ── Requests con status 429 (rate limited) ────────────────────────────────
    echo -e "${BOLD}🚫 IPs bloqueadas por rate limit (HTTP 429)${RESET}"
    echo -e "─────────────────────────────────────────────────────"

    local blocked_ips
    blocked_ips=$(tail -n "$log_lines" "$ACCESS_LOG" \
        | awk '$9 == "429" {print $1}' \
        | sort | uniq -c | sort -rn \
        | head -n "$TOP_N")

    if [[ -z "$blocked_ips" ]]; then
        echo -e "  ${GREEN}✓ Sin rate limits activos.${RESET}"
    else
        echo "$blocked_ips" | while read -r count ip; do
            printf "${RED}  %-6s  %s${RESET}\n" "$count" "$ip"
        done
    fi

    echo ""

    # ── Top endpoints atacados ────────────────────────────────────────────────
    echo -e "${BOLD}🎯 Endpoints más atacados (status 4xx/5xx)${RESET}"
    echo -e "─────────────────────────────────────────────────────"

    tail -n "$log_lines" "$ACCESS_LOG" \
        | awk '$9 ~ /^4|^5/ {print $7}' \
        | sort | uniq -c | sort -rn \
        | head -n 10 \
        | while read -r count endpoint; do
            printf "${YELLOW}  %-6s  %s${RESET}\n" "$count" "$endpoint"
          done || echo -e "  ${GREEN}Sin errores recientes.${RESET}"

    echo ""

    # ── Resumen de status codes ───────────────────────────────────────────────
    echo -e "${BOLD}📈 Resumen de status codes${RESET}"
    echo -e "─────────────────────────────────────────────────────"
    tail -n "$log_lines" "$ACCESS_LOG" \
        | awk '{print $9}' \
        | sort | uniq -c | sort -rn \
        | while read -r count status; do
            local color="$GREEN"
            [[ "$status" =~ ^4 ]] && color="$YELLOW"
            [[ "$status" =~ ^5 ]] && color="$RED"
            printf "${color}  %-6s  HTTP %s${RESET}\n" "$count" "$status"
          done

    echo ""

    # ── Errores de nginx ──────────────────────────────────────────────────────
    if [[ -f "$ERROR_LOG" ]]; then
        local error_count
        error_count=$(tail -n 200 "$ERROR_LOG" | grep -c "limiting requests" 2>/dev/null || echo 0)
        echo -e "${BOLD}⚠️  Nginx rate-limit events (últimas 200 líneas de error.log): ${error_count}${RESET}"
    fi

    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════════════${RESET}"

    # ── Comando de bloqueo rápido ─────────────────────────────────────────────
    echo ""
    echo -e "${BOLD}🔒 Bloquear una IP manualmente:${RESET}"
    echo -e "   sudo iptables -A INPUT -s <IP> -j DROP"
    echo -e "   sudo iptables -A INPUT -s <IP> -j DROP && sudo iptables-save"
    echo ""
    echo -e "${BOLD}🔓 Desbloquear una IP:${RESET}"
    echo -e "   sudo iptables -D INPUT -s <IP> -j DROP"
    echo ""
}

# ── Run ───────────────────────────────────────────────────────────────────────
if $WATCH_MODE; then
    echo "Modo watch activo. Actualizando cada ${WATCH_INTERVAL}s. Ctrl+C para salir."
    while true; do
        show_report
        sleep "$WATCH_INTERVAL"
    done
else
    show_report
fi
