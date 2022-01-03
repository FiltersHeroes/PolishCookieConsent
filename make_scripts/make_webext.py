#!/usr/bin/env python3
# pylint: disable=C0103
"""Depends: Python 3.6+, Requests"""
import os
import sys
import shutil
import make_assets as mkassets
if sys.argv[1] == "chromium":
    import json

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

webext_path = pn("./platform/webext")

for f in os.listdir(webext_path):
    shutil.move(pj(webext_path, f), pn("./"))

# Cleanup
unnecessary_folders = [pn("./platform"), pn("./cookieBase")]
for u_f in unnecessary_folders:
    shutil.rmtree(u_f)
os.remove(pn("./PCB.txt"))

if sys.argv[1] == "chromium":
    with open(pj(temp_path, "manifest.json"), "r", encoding='utf-8') as m_f:
        manifest = json.load(m_f)
    del manifest['applications']
    with open(pj(temp_path, "manifest.json"), "w", encoding='utf-8') as m_f:
        json.dump(manifest, m_f, indent=2)

# Place assets in correct place
mkassets.run(main_path)

# Send extension to browser's store
if os.environ.get("CI") == "true":
    if sys.argv[1] == "chromium":
        browser = "chrome"
    elif sys.argv[1] == "firefox":
        browser = "firefox"
    os.system("npx shipit "+browser+" ./")

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
webext = pj(artifacts_path, "PolishCookieConsent_"+browser+"."+webext_ext)
if os.path.exists(webext):
    os.remove(webext)
if not os.path.exists(artifacts_path):
    os.makedirs(artifacts_path)
shutil.make_archive(
    pj(artifacts_path, "PolishCookieConsent_"+browser), 'zip', "./")
if sys.argv[1] == "firefox":
    os.rename(pj(artifacts_path, "PolishCookieConsent_Firefox.zip"), webext)

# Cleanup
os.chdir(main_path)
shutil.rmtree(temp_path)
