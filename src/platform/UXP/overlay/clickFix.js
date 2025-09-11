// Fix Pale Moon nasty bug with other mouse button working as left click (supposedly related with https://forum.palemoon.org/viewtopic.php?t=30469)
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
