#!/bin/bash

# v1.0.3

cat > /tmp/update_PolishCookieConsent_chromium << 'EOF'
#!/bin/sh
NEW_VERSION=$(curl --silent "https://api.github.com/repos/PolishFiltersTeam/PolishCookieConsent/releases/latest" |grep '"tag_name":'|sed -E 's/.*"([^"]+)".*/\1/' | awk '{gsub("v", "");print}')

PATH_EXT=~/Rozszerzenia/PolishCookieConsent

OLD_VERSION=$(cat $PATH_EXT/manifest.json | grep '"version":'|sed -E 's/.*"([^"]+)".*/\1/')

if (( $(echo "$NEW_VERSION $OLD_VERSION" | awk '{print ($1 > $2)}') )); then
    export DISPLAY=:0.0
    notify-send 'Powiadomienie o aktualizacji' 'Nowa wersja rozszerzenia Polska Ciasteczkowa Zgoda jest już dostępna! Pobieram nową wersję...'
    cd $(xdg-user-dir DOWNLOAD)
    wget https://github.com/PolishFiltersTeam/PolishCookieConsent/releases/download/v${NEW_VERSION}/PolishCookieConsent_chromium.zip -P ./PolishCookieConsent_v$NEW_VERSION/
    unzip -o ./PolishCookieConsent_v$NEW_VERSION/PolishCookieConsent_chromium.zip -d ~/Rozszerzenia/PolishCookieConsent
    rm -rf ./PolishCookieConsent_v$NEW_VERSION
    export DISPLAY=:0.0
    notify-send 'Sukces' 'Rozszerzenie Polska Ciasteczkowa Zgoda zostało zaktualizowane. Proszę zrestartować przeglądarkę.'
else
    notify-send 'Informacja' 'Aktualnie nie ma nowszej wersji rozszerzenia Polska Ciasteczkowa Zgoda'
fi;
EOF

echo "Potrzebujemy praw roota, by ustawić automatyczne cotygodniowe sprawdzanie i pobieranie aktualizacji."
sudo mv /tmp/update_PolishCookieConsent_chromium /etc/cron.weekly/
sudo chmod +x /etc/cron.weekly/update_PolishCookieConsent_chromium
