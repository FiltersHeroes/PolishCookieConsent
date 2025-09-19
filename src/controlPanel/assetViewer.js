// Title
document.querySelector("title").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " - " + PCC_vAPI.i18n.getMessage("assetViewer");

let assetEditor = cm6.createEditor({
    parent: document.querySelector('#editorWrapper'),
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
var caseToggleBtn = document.querySelector("#caseToggleBtn");
var findSelectionBtn = document.querySelector("#findSelectionBtn");
var counter = document.querySelector('.cm-search-widget-count');


searchInput.value = "";
cm6.initCustomSearch(assetEditor, searchInput, counter, nextMatchBtn, prevMatchBtn, caseToggleBtn, findSelectionBtn)
