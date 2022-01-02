#!/usr/bin/env python3
"""Depends: Requests"""
import os
import shutil
import json
import requests

def run(main_path):
    """Place assets in correct place."""
    pn = os.path.normpath
    with open(pn("./assets/assets.json"), "r", encoding='utf-8') as assets:
        assets = json.load(assets)
        for asset_name in assets:
            if asset_name != "assets.json":
                PCCassets_path = pn(main_path+"/../PCCassets")
                if not os.path.exists(PCCassets_path):
                    os.makedirs(PCCassets_path)
                if not os.path.exists(pn(PCCassets_path+"/"+asset_name+".txt")):
                    asset_response = requests.get(assets[asset_name]["contentURL"], allow_redirects=True)
                    with open(pn(PCCassets_path+"/"+asset_name+".txt"), "w", encoding='utf-8') as ass_f:
                        ass_f.write(asset_response.text)
                shutil.copy(pn(main_path+"/../PCCassets/"+asset_name+".txt"), pn("./assets/"))
