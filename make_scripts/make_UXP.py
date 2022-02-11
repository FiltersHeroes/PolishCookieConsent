#!/usr/bin/env python3
# pylint: disable=C0103
"""Depends: Python 3.6+, Requests"""
import os
import sys
import json
import glob
import shutil
import convert_locales_to_legacy_version as ljson2prop
import make_assets as mkassets

pj = os.path.join
pn = os.path.normpath

script_path = os.path.dirname(os.path.realpath(__file__))
main_path = pn(script_path+"/..")
temp_path = pj(main_path, "src_temp")

if os.path.exists(temp_path):
    shutil.rmtree(temp_path)

os.chdir(main_path)

shutil.copytree(pn("./src"), temp_path)
shutil.copy(pn("./LICENSE"), temp_path)

os.chdir(temp_path)

UXP_path = pn("./platform/UXP")

for f in os.listdir(UXP_path):
    shutil.move(pj(UXP_path, f), temp_path)

shutil.rmtree(pn("./platform"))

# Add info about locales and version to manifest files
locales_dir = pn("./_locales")
localized = ''
pos = 0
for locale in sorted(os.listdir(locales_dir)):
    if locale != "en":
        pos += 1
        with open(pj(locales_dir, locale, "messages.json"), "r", encoding='utf-8') as l_f:
            strings = json.load(l_f)
            extName = strings["extensionName"]["message"]
            extDesc = strings["extensionDescription"]["message"]
            if pos != 1:
                localized += "\n\n"
            localized += f'''\
  <em:localized>
    <Description
      em:locale="{locale}"
      em:name="{extName}"
      em:description="{extDesc}"/>
  </em:localized>\
'''
            with open(pn("./locales.manifest"), "a", encoding='utf-8') as l_m:
                l_m.write("locale PCC "+locale+" ./_locales/"+locale+"/\n")

ext_version = "dev-build"
if "PCC_VERSION" in os.environ:
    ext_version = os.environ.get("PCC_VERSION")
elif len(sys.argv) >= 2:
    ext_version = sys.argv[1]

install_file = pn("./install.rdf")
with open(install_file, 'r', encoding='utf-8') as install_f:
    data = install_f.read()
    data = data.replace("_localized_", localized)
    data = data.replace("_version_", ext_version)
with open(install_file, 'w', encoding='utf-8') as install_f:
    install_f.write(data)

# Convert locales from json to properties format
ljson2prop.run(temp_path)

# Cleanup
unnecessary_f = [pn("./icons/icon96.png"),
                 pn("./icons/icon128.png")]
unnecessary_f += glob.glob(pn("./_locales/*/messages.json"))
for u_f in unnecessary_f:
    os.remove(u_f)
shutil.rmtree(pn("./cookieBase"))

# Place assets in correct place
mkassets.run(main_path)

# Create xpi
artifacts_path = pj(main_path, "artifacts")
f_name = "PolishCookieConsent-"+ext_version+"_UXP"
UXP_xpi = pj(artifacts_path, f_name + ".xpi")
if os.path.exists(UXP_xpi):
    os.remove(UXP_xpi)
if not os.path.exists(artifacts_path):
    os.makedirs(artifacts_path)
shutil.make_archive(pj(artifacts_path, f_name), 'zip', "./")
os.rename(pj(artifacts_path, f_name + ".zip"), UXP_xpi)

# Cleanup
os.chdir(main_path)
shutil.rmtree(temp_path)
