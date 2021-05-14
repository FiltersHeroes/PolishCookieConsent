#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$(realpath -s "$0")")

glowna_sciezka=$(git -C "$sciezka" rev-parse --show-toplevel)
tymczasowy="$glowna_sciezka"/src_temp

cd "$glowna_sciezka"/src || exit

mkdir "$tymczasowy"
cp -r "$glowna_sciezka"/src/* "$tymczasowy"/

cd "$tymczasowy" || exit

cp ../LICENSE "$tymczasowy"/
mv "$tymczasowy"/platform/webext/* "$tymczasowy"/
jq 'del(.applications)' manifest.json >manifest.json.temp
rm -r manifest.json
mv manifest.json.temp manifest.json
rm -rf "$tymczasowy"/platform/
rm -r "$tymczasowy"/PCB.txt

if [ "$CI" = "true" ]; then
    npx shipit chrome ./
fi

if [ -d "./web-ext-artifacts" ]; then
    rm -rvf ./web-ext-artifacts
fi

zip -r9 PolishCookieConsent_Chromium.zip ./*

cd "$glowna_sciezka" || exit

if [ ! -d "./artifacts" ]; then
    mkdir ./artifacts
fi

mv "$tymczasowy"/PolishCookieConsent_Chromium.zip ./artifacts
rm -rf "$tymczasowy"
