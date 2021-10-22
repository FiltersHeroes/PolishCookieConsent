/*******************************************************************************
    Copyright (C) 2021 Filters Heroes
    This file is part of Polish Cookie Consent.

    Polish Cookie Consent is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Polish Cookie Consent is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Polish Cookie Consent. If not, see {http://www.gnu.org/licenses/}.
*/

// Title
document.querySelector("title").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " - " + PCC_vAPI.i18n.getMessage("assetViewer");

// Apply dark theme
let rootH = document.querySelector(":root");
PCC_vAPI.storage.local.get("colorScheme").then(function (colorScheme) {
    let condition;
    if (colorScheme) {
        condition = colorScheme == "dark";
    } else {
        condition = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    if (condition) {
        rootH.classList.add("dark");
    }
});

let assetEditor = new CodeMirror(document.querySelector('#content'), {
    autofocus: true,
    gutters: ['CodeMirror-linenumbers'],
    lineNumbers: true,
    lineWrapping: true,
    matchBrackets: true,
    mode: "filters",
    readOnly: true,
    maxScanLines: 1,
    styleActiveLine: true
});

let url = new URLSearchParams(window.location.search).get("url");

PCC_vAPI.storage.local.get(url).then(function (result) {
    assetEditor.setValue(result);
});

