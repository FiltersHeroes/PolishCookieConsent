#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")

cd $sciezka/../src

npx web-ext-submit

if [ -d "./web-ext-artifacts" ]; then
    rm -rvf ./web-ext-artifacts
fi

cd ..

zip -r PolishCookieConsent_firefox.xpi *

if [ ! -d "./artifacts" ]; then
    mkdir ./artifacts
fi

mv ./PolishCookieConsent_firefox.xpi ./artifacts
