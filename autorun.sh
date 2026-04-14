#!/usr/bin/env bash

# Use printf for terminal titles - it's more portable than echo -ne
printf "\033]0;Naissance\007"
echo "[Naissance HGIS] Auto-run is starting .."

INSTALL_SENTINEL=".last_install"

do_install() {
    echo "[Naissance HGIS] Dependencies out of date or missing. Installing..."
    rm -rf node_modules
    rm -f package-lock.json
    npm install
    # Ensure binaries are executable across all platforms
    chmod -R +x node_modules/.bin/ 2>/dev/null || true
    touch "$INSTALL_SENTINEL"
}

# The [[ ]] syntax is more robust in Bash/Zsh than the single [ ]
if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "$INSTALL_SENTINEL" ]]; then
    do_install
else
    echo "[Naissance HGIS] node_modules is up to date. Skipping install."
fi

while true
do
    npm start
    echo "[Naissance HGIS] Crashed! Restarting in 30 seconds .."
    sleep 30
done