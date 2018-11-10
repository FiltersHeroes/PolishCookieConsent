#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")

cd $sciezka/../src
web-ext sign --api-key=${API_KEY} --api-secret=${API_SECRET}
mv ./web-ext-artifacts/polish_cookie_consent-*.xpi ../PolishCookieConsent_firefox.xpi
