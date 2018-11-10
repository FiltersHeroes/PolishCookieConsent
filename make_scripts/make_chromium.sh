#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")

cd $sciezka/../src
zip -r PolishCookieConsent_chromium.zip *
mv ./PolishCookieConsent_chromium.zip ../
