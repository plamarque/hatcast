#!/usr/bin/env bash
# Charge un fichier .env à la façon des outils dotenv : KEY=value, commentaires #, lignes vides,
# préfixe optionnel « export ». Exporte chaque variable vers l’environnement du shell courant.
#
# Usage (ne pas exécuter directement ; à sourcer) :
#   source "$(dirname "$0")/load-dotenv.sh"
#   load_dotenv "/chemin/vers/.env"

load_dotenv() {
  local f="${1:-}"
  [[ -n "$f" && -f "$f" ]] || return 0

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" ]] && continue

    if [[ "$line" =~ ^export[[:space:]]+(.+)$ ]]; then
      line="${BASH_REMATCH[1]}"
    fi

    if [[ ! "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      continue
    fi

    local key="${BASH_REMATCH[1]}"
    local val="${BASH_REMATCH[2]}"
    val="${val%$'\r'}"

    if [[ "$val" =~ ^\"(.*)\"$ ]]; then
      val="${BASH_REMATCH[1]}"
      val="${val//\\\"/\"}"
      val="${val//\\\$/\$}"
    elif [[ "$val" =~ ^\'(.*)\'$ ]]; then
      val="${BASH_REMATCH[1]}"
    fi

    # export (pas « declare -g » : absent de Bash 3.2 / macOS)
    export "$key"="$val"
  done <"$f"
}
