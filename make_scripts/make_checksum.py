#!/usr/bin/env python3
# pylint: disable=C0103
"""Create checksum file"""
import os
import hashlib

pj = os.path.join
pn = os.path.normpath

script_path = os.path.dirname(os.path.realpath(__file__))
main_path = pn(script_path+"/..")
artifacts_path = pj(main_path, "artifacts")
checksum_file_path = pj(artifacts_path, "PolishCookieConsent.sha256")

if os.path.exists(checksum_file_path):
    os.remove(checksum_file_path)

ext_files = [pj(artifacts_path, "PolishCookieConsent_Chromium.zip"),
             pj(artifacts_path, "PolishCookieConsent_Firefox.xpi"),
             pj(artifacts_path, "PolishCookieConsent_UXP.xpi")]

for ext_file in ext_files:
    if os.path.exists(ext_file):
        with open(ext_file, 'rb') as file_to_check:
            data = file_to_check.read()
        checksum_ext = hashlib.sha256(data).hexdigest()
        with open(checksum_file_path, "a", encoding='utf-8') as checksum_file:
            checksum_file.write(
                checksum_ext+" "+os.path.basename(ext_file)+"\n")
