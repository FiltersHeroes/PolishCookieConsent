#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")

cd $sciezka/../src

#npx web-ext-submit
zip -r PolishCookieConsent_firefox.xpi *

mkdir ./web-ext-artifacts
mv ./PolishCookieConsent_firefox.xpi ./web-ext-artifacts
