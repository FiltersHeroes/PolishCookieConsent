#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")

cd $sciezka/../src
zip -r PolishCookieConsent_chromium.zip *
mkdir ./web-ext-artifacts
mv ./PolishCookieConsent_chromium.zip ./web-ext-artifacts
