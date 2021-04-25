#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$(realpath -s "$0")")

glowna_sciezka=$(git -C "$sciezka" rev-parse --show-toplevel)
tymczasowy="$glowna_sciezka"/release_notes

cd "$glowna_sciezka" || exit
mkdir "$tymczasowy"

touch "$tymczasowy"/release_notes.md

cat <<EOT >>"$tymczasowy"/release_notes.md
## Sumy kontrolne SHA-256
EOT

if [[ -f "./artifacts/PolishCookieConsent_Chromium.zip" ]]; then
checksum_chromium=$(sha256sum ./artifacts/PolishCookieConsent_Chromium.zip | awk '{print $1}')
    cat <<EOT >>"$tymczasowy"/release_notes.md
$checksum_chromium **PolishCookieConsent_Chromium.zip**
EOT
fi

if [[ -f "./artifacts/PolishCookieConsent_Firefox.zip" ]]; then
checksum_ff=$(sha256sum ./artifacts/PolishCookieConsent_Firefox.xpi | awk '{print $1}')
    cat <<EOT >>"$tymczasowy"/release_notes.md
$checksum_ff **PolishCookieConsent_Firefox.xpi**
EOT
fi

if [[ -f "./artifacts/PolishCookieConsent_UXP.xpi" ]]; then
checksum_uxp=$(sha256sum ./artifacts/PolishCookieConsent_UXP.xpi | awk '{print $1}')
    cat <<EOT >>"$tymczasowy"/release_notes.md
$checksum_uxp **PolishCookieConsent_UXP.xpi**
EOT
fi

cd "$glowna_sciezka" || exit
