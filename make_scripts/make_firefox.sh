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
rm -rf "$tymczasowy"/platform/

rm -r "$tymczasowy"/PCB.txt
rm -rf "$tymczasowy"/cookieBase/

if [ "$CI" = "true" ]; then
    wget "https://raw.githubusercontent.com/FiltersHeroes/PCCassets/main/plCDB.txt" -P "./assets/"
    wget "https://raw.githubusercontent.com/FiltersHeroes/PCCassets/main/euCDB.txt" -P "./assets/"
else
    cp "$glowna_sciezka"/../PCCassets/plCDB.txt ./assets/
    cp "$glowna_sciezka"/../PCCassets/euCDB.txt ./assets/
fi

if [ "$CI" = "true" ]; then
    npx shipit firefox ./
fi

if [ -d "./web-ext-artifacts" ]; then
    rm -rvf ./web-ext-artifacts
fi

zip -r9 PolishCookieConsent_Firefox.xpi ./*

cd "$glowna_sciezka" || exit

if [ ! -d "./artifacts" ]; then
    mkdir ./artifacts
fi

mv "$tymczasowy"/PolishCookieConsent_Firefox.xpi "$glowna_sciezka"/artifacts
rm -rf "$tymczasowy"
