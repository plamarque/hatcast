#!/usr/bin/env bash
# Charge un fichier .env : KEY=value, commentaires #, lignes vides, préfixe optionnel « export ».
# Compatible bash et zsh lorsque le fichier est sourcé (macOS Terminal par défaut).
#
# Usage :
#   source scripts/load-dotenv.sh
#   load_dotenv "/chemin/vers/.env"
#
# Sous zsh, ne pas lancer avec bash -c sauf pour une commande isolée ; ce script gère zsh directement.

load_dotenv() {
  local f="${1:-}"
  [[ -n "$f" && -f "$f" ]] || return 0

  # zsh : match[] ; bash : BASH_REMATCH[]
  local _m1 _m2

  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" ]] && continue

    if [[ "$line" =~ ^export[[:space:]]+(.+)$ ]]; then
      if [[ -n "${ZSH_VERSION:-}" ]]; then
        line="${match[1]}"
      else
        line="${BASH_REMATCH[1]}"
      fi
    fi

    if [[ ! "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      continue
    fi

    if [[ -n "${ZSH_VERSION:-}" ]]; then
      _m1="${match[1]}"
      _m2="${match[2]}"
    else
      _m1="${BASH_REMATCH[1]}"
      _m2="${BASH_REMATCH[2]}"
    fi

    local key="$_m1"
    local val="$_m2"
    val="${val%$'\r'}"

    if [[ "$val" =~ ^\"(.*)\"$ ]]; then
      if [[ -n "${ZSH_VERSION:-}" ]]; then
        val="${match[1]}"
      else
        val="${BASH_REMATCH[1]}"
      fi
      val="${val//\\\"/\"}"
      val="${val//\\\$/\$}"
    elif [[ "$val" =~ ^\'(.*)\'$ ]]; then
      if [[ -n "${ZSH_VERSION:-}" ]]; then
        val="${match[1]}"
      else
        val="${BASH_REMATCH[1]}"
      fi
    fi

    export "$key=$val"
  done <"$f"
}
