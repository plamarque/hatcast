#!/usr/bin/env bash
# OPS-10 — Vérifie les enregistrements mail hatcast.app (Routing + Sending + DMARC)
# Utilise 1.1.1.1 pour éviter un résolveur local vide ou en cache.
set -euo pipefail

DOMAIN="${1:-hatcast.app}"
RESOLVER="${OPS10_DNS_RESOLVER:-1.1.1.1}"

dig_r() {
  dig "@${RESOLVER}" "$@" +short 2>/dev/null || true
}

ok() { printf '  [OK] %s\n' "$1"; }
miss() { printf '  [--] %s\n' "$1"; }
warn() { printf '  [!!] %s\n' "$1"; }

echo "=== ${DOMAIN} (resolver ${RESOLVER}) ==="
echo ""

echo "Phase A — Email Routing (@)"
mx="$(dig_r MX "${DOMAIN}")"
if [[ -n "${mx}" ]] && echo "${mx}" | grep -q 'mx.cloudflare.net'; then
  ok "MX @ → Cloudflare Email Routing"
  echo "${mx}" | sed 's/^/       /'
else
  miss "MX @ (attendu route*.mx.cloudflare.net)"
fi

spf="$(dig_r TXT "${DOMAIN}" | grep -i 'v=spf1' || true)"
if echo "${spf}" | grep -q '_spf.mx.cloudflare.net'; then
  ok "SPF @ inclut _spf.mx.cloudflare.net"
else
  miss "SPF @ pour Routing"
fi

dkim_r="$(dig_r TXT "cf2024-1._domainkey.${DOMAIN}")"
if [[ -n "${dkim_r}" ]] && echo "${dkim_r}" | grep -qi 'v=DKIM1'; then
  ok "DKIM Routing cf2024-1._domainkey"
else
  miss "DKIM cf2024-1._domainkey"
fi

echo ""
echo "Phase B — Email Sending (cf-bounce) + DMARC"
mx_b="$(dig_r MX "cf-bounce.${DOMAIN}")"
if [[ -n "${mx_b}" ]] && echo "${mx_b}" | grep -q 'mx.cloudflare.net'; then
  ok "MX cf-bounce"
else
  miss "MX cf-bounce (Sending / bounces)"
fi

spf_b="$(dig_r TXT "cf-bounce.${DOMAIN}" | grep -i 'v=spf1' || true)"
if echo "${spf_b}" | grep -q '_spf.mx.cloudflare.net'; then
  ok "SPF cf-bounce"
else
  miss "SPF cf-bounce"
fi

dkim_s="$(dig_r TXT "cf-bounce._domainkey.${DOMAIN}")"
if [[ -n "${dkim_s}" ]] && echo "${dkim_s}" | grep -qi 'v=DKIM1'; then
  ok "DKIM Sending cf-bounce._domainkey"
else
  miss "DKIM cf-bounce._domainkey — vérifier Email Sending → Settings dans le dashboard"
fi

dmarc="$(dig_r TXT "_dmarc.${DOMAIN}")"
if [[ -n "${dmarc}" ]]; then
  if echo "${dmarc}" | grep -q 'p=reject'; then
    warn "DMARC présent mais p=reject — OPS-10 recommande p=none au départ"
  elif echo "${dmarc}" | grep -q 'p=none'; then
    ok "DMARC p=none"
  else
    ok "DMARC présent : ${dmarc}"
  fi
else
  miss "DMARC _dmarc (recommandé v=DMARC1; p=none; rua=mailto:impropick@gmail.com)"
fi

echo ""
echo "Rappel : les règles info@ / noreply@ ne apparaissent pas dans le DNS — à tester par envoi de mails."
echo "Comparer avec le resolver système : dig MX ${DOMAIN} +short"
