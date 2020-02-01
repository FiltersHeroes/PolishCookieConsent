#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$0")
tymczasowy="$sciezka"/../src_temp

cd "$sciezka"/.. || exit

mkdir "$tymczasowy"
cp -r "$sciezka"/../src/* "$tymczasowy"/

python3 "$sciezka"/convert_locales_to_legacy_version.py "$tymczasowy"
rm -r "$tymczasowy"/_locales/*/messages.json

cd "$tymczasowy" || exit
jpm xpi

mkdir "$sciezka"/../xpi
mv "$tymczasowy"/*.xpi "$sciezka"/../xpi/
rm -r "$tymczasowy"
