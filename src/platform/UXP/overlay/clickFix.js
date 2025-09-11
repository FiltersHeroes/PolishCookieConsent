// Fix Pale Moon "bug" with other mouse button working as left click (https://repo.palemoon.org/MoonchildProductions/UXP/issues/2515)
window.addEventListener("DOMContentLoaded", (e) => {
    let doc = e.target;
    if (doc.nodeType === Node.DOCUMENT_NODE &&
        doc.documentURI.startsWith("chrome://pcc/content/")) {

        doc.addEventListener("click", function (ev) {
            if (ev.button !== 0) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        }, true);
    }
}, true);
