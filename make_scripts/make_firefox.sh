#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")

cd $sciezka/../src

function npm-do { (PATH=$(npm bin):$PATH; eval $@;) }

npm-do shipit firefox ./

if [ -f ./web-ext-artifacts/polish_cookie_consent-*.xpi ]; then
mv ./web-ext-artifacts/polish_cookie_consent-*.xpi ../PolishCookieConsent_firefox.xpi
fi
