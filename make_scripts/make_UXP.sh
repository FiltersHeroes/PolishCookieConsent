#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$(realpath -s "$0")")

glowna_sciezka="$sciezka"/..
tymczasowy="$glowna_sciezka"/src_temp

cd "$glowna_sciezka" || exit

mkdir "$tymczasowy"
cp -r ./src/* "$tymczasowy"/
cp ./LICENSE "$tymczasowy"/

cd "$tymczasowy" || exit

mv ./platform/UXP/* ./
rm -rf ./platform/

mapfile -t locales < <(find ./_locales -maxdepth 1 -exec basename {} \; | sed s/en$// | sed s/_locales$// | sed -r '/^\s*$/d' | sort -u)

for locale in "${locales[@]}"; do
    extName=$(jq -r '.extensionName.message' ./_locales/"$locale"/messages.json)
    extDesc=$(jq -r '.extensionDescription.message' ./_locales/"$locale"/messages.json)
    localized+=$(
        cat <<EOF

    <em:localized>
      <Description
        em:locale="$locale"
        em:name="$extName"
        em:description="$extDesc"/>
    </em:localized>
\l
EOF
    )

    cat >>./locales.manifest <<END
locale PCC $locale ./_locales/$locale/
END

done

localized=$(echo "${localized}" | sed '/^$/d' | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/\$/\\$/g')
sed -i "s|_localized_|$localized|" ./install.rdf

python3 -c "import sys;sys.path.insert(0,'$sciezka');import convert_locales_to_legacy_version as ljson2prop;ljson2prop.run('$tymczasowy')"

rm -r ./_locales/*/messages.json
rm -r ./icons/icon96.png
rm -r ./icons/icon128.png

rm -r ./PCB.txt
rm -rf ./cookieBase

if [ "$CI" = "true" ]; then
    wget "https://raw.githubusercontent.com/FiltersHeroes/PCCassets/main/plCDB.txt" -P "./assets/"
    wget "https://raw.githubusercontent.com/FiltersHeroes/PCCassets/main/euCDB.txt" -P "./assets/"
else
    cp "$glowna_sciezka"/../PCCassets/plCDB.txt ./assets/
    cp "$glowna_sciezka"/../PCCassets/euCDB.txt ./assets/
fi

zip -r9 PolishCookieConsent_UXP.xpi ./*

cd "$glowna_sciezka" || exit

if [ ! -d "./artifacts" ]; then
    mkdir ./artifacts
fi

mv "$tymczasowy"/PolishCookieConsent_UXP.xpi "$glowna_sciezka"/artifacts
rm -rf "$tymczasowy"
