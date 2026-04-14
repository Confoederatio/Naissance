echo -ne "\033]0;Naissance\007"
echo "[Naissance HGIS] Auto-run is starting .."

# Define a hidden file to track the last installation state
INSTALL_SENTINEL=".last_install"

# Function to perform the install
do_install() {
    echo "[Naissance HGIS] Dependencies out of date or missing. Installing..."
    rm -rf node_modules
    rm -f package-lock.json
    npm install
    chmod -R +x node_modules/.bin/
    # Update the timestamp of the sentinel file
    touch "$INSTALL_SENTINEL"
}

# Logic to determine if reinstall is needed:
# 1. Check if node_modules exists
# 2. Check if package.json is newer than our sentinel file
if [ ! -d "node_modules" ] || [ "package.json" -nt "$INSTALL_SENTINEL" ]; then
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