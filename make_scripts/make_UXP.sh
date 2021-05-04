#!/bin/bash

# Sciezka to miejsce, w którym znajduje się skrypt
sciezka=$(dirname "$(realpath -s "$0")")

glowna_sciezka=$(git -C "$sciezka" rev-parse --show-toplevel)
tymczasowy="$glowna_sciezka"/src_temp

cd "$glowna_sciezka"/src || exit

mkdir "$tymczasowy"
cp -r "$glowna_sciezka"/src/* "$tymczasowy"/

cd "$tymczasowy" || exit

mv "$tymczasowy"/platform/UXP/* "$tymczasowy"/
rm -rf "$tymczasowy"/platform/

mapfile -t locales < <(find "$tymczasowy"/_locales -maxdepth 1 -exec basename {} \; | sed s/en$// | sed s/_locales$// | sed -r '/^\s*$/d' | sort -u)

for locale in "${locales[@]}"; do
extName=$(jq -r '.extensionName.message' "$tymczasowy"/_locales/"$locale"/messages.json)
extDesc=$(jq -r '.extensionDescription.message' "$tymczasowy"/_locales/"$locale"/messages.json)
localized+=$(cat <<EOF

    <em:localized>
      <Description
        em:locale="$locale"
        em:name="$extName"
        em:description="$extDesc"/>
    </em:localized>
\l
EOF
)
cat >> "$tymczasowy"/locales.manifest << END
locale PCC $locale ./_locales/$locale/
END
done

localized=$(echo "${localized}" | sed ':a;N;$!ba;s/\n/\\n/g' | sed 's/\$/\\$/g' | sed '/^$/d')
sed -i "s|_localized_|$localized|" "$tymczasowy"/install.rdf

python3 "$sciezka"/convert_locales_to_legacy_version.py "$tymczasowy"
rm -r "$tymczasowy"/_locales/*/messages.json
rm -r "$tymczasowy"/PCB.txt
rm -r "$tymczasowy"/icons/icon96.png
rm -r "$tymczasowy"/icons/icon128.png

zip -r9 PolishCookieConsent_UXP.xpi ./*

cd "$glowna_sciezka" || exit

if [ ! -d "./artifacts" ]; then
    mkdir ./artifacts
fi

mv "$tymczasowy"/PolishCookieConsent_UXP.xpi "$glowna_sciezka"/artifacts
rm -rf "$tymczasowy"
