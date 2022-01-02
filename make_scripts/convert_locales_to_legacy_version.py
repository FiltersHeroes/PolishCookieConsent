#!/usr/bin/env python3
# Based on https://github.com/gorhill/uBlock-for-firefox-legacy/blob/master/tools/make-firefox-legacy-meta.py.
# Thanks for https://github.com/gorhill

import os
import json
import re
from collections import OrderedDict

def run(build_dir):
    pj = os.path.join

    locale_dir = pj(build_dir, '_locales')

    for locale in sorted(os.listdir(locale_dir)):
        locale_path = pj(locale_dir, locale, 'messages.json')
        with open(locale_path, encoding='utf-8') as f:
            strings = json.load(f, object_pairs_hook=OrderedDict)
        locale = locale.replace('_', '-')
        locale_path = pj(locale_dir, locale, 'messages.properties')
        with open(locale_path, 'wt', encoding='utf-8', newline='\n') as f:
            for string_name in strings:
                string = strings[string_name]['message']

                placeholders = ''
                if 'placeholders' in strings[string_name]:
                    placeholders = strings[string_name]['placeholders']

                for placeholder_name in placeholders:
                    placeholder = placeholders[placeholder_name]
                    if "content" in placeholder:
                        placeholder_content = placeholder["content"].replace(
                            "$", "%")
                        placeholder_content = re.sub(
                            re.escape(placeholder_content), r'\g<0>'+"$S", placeholder_content)
                        string = re.sub(re.escape("$"+placeholder_name+"$"),
                                        placeholder_content, string, flags=re.IGNORECASE)

                f.write(string_name)
                f.write('=')
                f.write(string.replace('\n', r'\n'))
                f.write('\n')
