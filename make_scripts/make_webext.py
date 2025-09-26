#!/usr/bin/env python3
# pylint: disable=C0103
"""Depends: Python 3.6+, Requests"""
import os
import sys
import subprocess
import shutil
import json
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
shutil.copy(pn("./LICENSE"), pj(temp_path, "LICENSE.txt"))

os.chdir(temp_path)


webext_paths = [pn(f"./platform/webext/{sys.argv[1]}"), pn("./platform/webext")]

for webext_path in webext_paths:
    for f in os.listdir(webext_path):
        full_path = os.path.join(webext_path, f)
        if (os.path.isfile(full_path)):
            shutil.move(pj(webext_path, f), pn("./"))

# Cleanup
unnecessary_folders = [pn("./platform")]
for u_f in unnecessary_folders:
    shutil.rmtree(u_f)

# Set correct version for extension and cleanup manifest
ext_version = "1.47.1"
if "PCC_VERSION" in os.environ:
    ext_version = os.environ.get("PCC_VERSION")
elif len(sys.argv) >= 3:
    ext_version = sys.argv[2]

with open(pj(temp_path, "manifest.json"), "r", encoding='utf-8') as m_f:
    manifest = json.load(m_f)
    manifest['version'] = ext_version
    with open(pj(temp_path, "manifest.json"), "w", encoding='utf-8') as m_f:
        json.dump(manifest, m_f, indent=2)

# Place assets in correct place
mkassets.run(main_path)

# Send extension to browser's store
if os.environ.get("TEST_MODE") != "true" and os.environ.get("CI") == "true":
    if sys.argv[1] == "chromium":
        subprocess.run(["pnpm", "dlx", "chrome-webstore-upload-cli"], text=True, check=False)
    elif sys.argv[1] == "firefox":
        subprocess.run(["pnpm", "dlx", "web-ext", "sign", "--channel", "listed"], text=True, check=False)

    # Cleanup
    we_artifacts_path = pn("./web-ext-artifacts")
    if os.path.exists(we_artifacts_path):
        shutil.rmtree(we_artifacts_path)

# Create extension file for installing in dev mode
artifacts_path = pj(main_path, "artifacts")
browser = sys.argv[1].title()
webext_ext = "xpi"
if sys.argv[1] == "chromium":
    webext_ext = "zip"
webext = pj(artifacts_path, "PolishCookieConsent-"+ext_version+"_"+browser+"."+webext_ext)
if os.path.exists(webext):
    os.remove(webext)
if not os.path.exists(artifacts_path):
    os.makedirs(artifacts_path)
shutil.make_archive(
    pj(artifacts_path, "PolishCookieConsent-"+ext_version+"_"+browser), 'zip', "./")
if sys.argv[1] == "firefox":
    os.rename(pj(artifacts_path, "PolishCookieConsent-"+ext_version+"_Firefox.zip"), webext)

# Cleanup
os.chdir(main_path)
shutil.rmtree(temp_path)
