import os
import json
import yaml

pj = os.path.join
pn = os.path.normpath

script_path = os.path.dirname(os.path.realpath(__file__))
main_path = pn(script_path+"/..")
website_path = pn(pj(main_path, "..", "PolishAnnoyanceFilters.netlify.app", "data"))

with open(pj(website_path, "CookieConsentNewSyntax.yaml"), "r", encoding="utf-8") as f:
    data = yaml.safe_load(f)

with open(pj(main_path, "src", "controlPanel", "syntax.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, sort_keys=False, ensure_ascii=False)


for subdir, _, files in os.walk(website_path):
    for file in files:
        if file == "PCC_functions.yaml":
            yaml_path = os.path.join(subdir, file)

            with open(yaml_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            json_path = pj(main_path, "src", "_locales", os.path.basename(subdir), "functions.json")

            # Zapis JSON
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, sort_keys=False, ensure_ascii=False)
