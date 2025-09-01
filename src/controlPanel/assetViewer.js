/*******************************************************************************
    Copyright (C) 2025 Filters Heroes
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

let assetEditor = cm6.createEditor({
    parent: document.querySelector('#content'),
    autofocus: true,
    extensions: [
        filtersMode,
        cm6.lineNumbers(),
        cm6.highlightActiveLine(),
        cm6.highlightActiveLineGutter(),
        cm6.drawSelection(),
        cm6.bracketMatching(),
        cm6.closeBrackets(),
        cm6.highlightSelectionMatches(),
        cm6.search(),
        cm6.EditorState.readOnly.of(true),
        cm6.EditorView.lineWrapping,
    ],
});


let url = new URLSearchParams(window.location.search).get("url");

PCC_vAPI.storage.local.get(url).then(function (result) {
    let flContent;
    if (url !== "userFilters") {
        const flResult = JSON.parse(result);
        flContent = flResult["content"];
        document.querySelector("#sourceURL").href = flResult["sourceURL"];
        document.querySelector("#sourceURL").removeAttribute("hidden");
    } else {
        flContent = result;
    }
    cm6.setValue(assetEditor, flContent);
});

var searchInput = document.querySelector("#searchbar");
var prevMatchBtn = document.querySelector("#prevMatchBtn");
var nextMatchBtn = document.querySelector("#nextMatchBtn");
var counter = document.querySelector('.cm-search-widget-count');

cm6.initCustomSearch(assetEditor, searchInput, counter, nextMatchBtn, prevMatchBtn)
