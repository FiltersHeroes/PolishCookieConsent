#!/usr/bin/env python3
# pylint: disable=C0103
"""Create checksum file"""
import os
import sys
import hashlib

pj = os.path.join
pn = os.path.normpath

script_path = os.path.dirname(os.path.realpath(__file__))
main_path = pn(script_path+"/..")
artifacts_path = pj(main_path, "artifacts")

# Set correct extension version
ext_version = "dev-build"
if "PCC_VERSION" in os.environ:
    ext_version = os.environ.get("PCC_VERSION")
elif len(sys.argv) >= 2:
    ext_version = sys.argv[1]

checksum_file_path = pj(
    artifacts_path, "PolishCookieConsent-"+ext_version+".sha256")

if os.path.exists(checksum_file_path):
    os.remove(checksum_file_path)

first_part_name = "PolishCookieConsent-"+ext_version+"_"
ext_files = [pj(artifacts_path, first_part_name+"Chromium.zip"),
             pj(artifacts_path, first_part_name+"Firefox.xpi"),
             pj(artifacts_path, first_part_name+"UXP.xpi")]

for ext_file in ext_files:
    if os.path.exists(ext_file):
        with open(ext_file, 'rb') as file_to_check:
            data = file_to_check.read()
        checksum_ext = hashlib.sha256(data).hexdigest()
        with open(checksum_file_path, "a", encoding='utf-8') as checksum_file:
            checksum_file.write(
                checksum_ext+" "+os.path.basename(ext_file)+"\n")
