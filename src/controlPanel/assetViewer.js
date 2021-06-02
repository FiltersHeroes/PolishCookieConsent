// Title
document.querySelector("title").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " - " + PCC_vAPI.i18n.getMessage("assetViewer");


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
