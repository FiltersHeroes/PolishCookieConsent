#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$(realpath -s "$0")")

glowna_sciezka=$(git -C "$sciezka" rev-parse --show-toplevel)
tymczasowy="$glowna_sciezka"/src_temp

cd "$glowna_sciezka"/src || exit

mkdir "$tymczasowy"
cp -r "$glowna_sciezka"/src/* "$tymczasowy"/

cd "$tymczasowy" || exit

mv "$tymczasowy"/platform/UXP/* "$tymczasowy"/
rm -rf "$tymczasowy"/platform/

python3 "$sciezka"/convert_locales_to_legacy_version.py "$tymczasowy"
rm -r "$tymczasowy"/_locales/*/messages.json
rm -r "$tymczasowy"/PCB.txt
rm -r "$tymczasowy"/icons/icon96.png
rm -r "$tymczasowy"/icons/icon128.png

zip -r9 PolishCookieConsent_UXP.xpi ./*

cd "$glowna_sciezka" || exit

if [ ! -d "./artifacts" ]; then
    mkdir ./artifacts
fi

mv "$tymczasowy"/PolishCookieConsent_UXP.xpi "$glowna_sciezka"/artifacts
rm -rf "$tymczasowy"
