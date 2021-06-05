#!/usr/bin/env python3
# Based on https://github.com/gorhill/uBlock-for-firefox-legacy/blob/master/tools/make-firefox-legacy-meta.py.
# Thanks for https://github.com/gorhill

import os
import json
import re
import sys
from io import open
from shutil import rmtree
from collections import OrderedDict

if len(sys.argv) == 1 or not sys.argv[1]:
    raise SystemExit('Build dir missing.')

def mkdirs(path):
    try:
        os.makedirs(path)
    finally:
        return os.path.exists(path)

pj = os.path.join

build_dir = os.path.abspath(sys.argv[1])
locale_dir = pj(build_dir, '_locales')
language_codes = []

for alpha2 in sorted(os.listdir(locale_dir)):
    locale_path = pj(locale_dir, alpha2, 'messages.json')
    with open(locale_path, encoding='utf-8') as f:
        strings = json.load(f, object_pairs_hook=OrderedDict)
    alpha2 = alpha2.replace('_', '-')
    language_codes.append(alpha2)
    mkdirs(pj(locale_dir, alpha2))
    locale_path = pj(locale_dir, alpha2, 'messages.properties')
    with open(locale_path, 'wt', encoding='utf-8', newline='\n') as f:
        for string_name in strings:
            string = strings[string_name]['message'].replace("$mfHelpPCCsyntax$", "%S").replace("$Project$", "%1$S").replace("$author$", "%2$S").replace("$contributors$", "%3$S").replace("$function$", "%S").replace("$filterList$", "%S")
            f.write(string_name)
            f.write(u'=')
            f.write(string.replace('\n', r'\n'))
            f.write(u'\n')
