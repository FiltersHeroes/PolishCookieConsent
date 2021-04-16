var wrapper = document.querySelectorAll(".wrapper:not(.wrapper-switch)");

document.querySelector("#changelog").dataset.href += "/v" + chrome.runtime.getManifest().version;

for (var i = 0; i < wrapper.length; i++) {
    wrapper[i].addEventListener('click', function (event) {
        chrome.tabs.create({ url: this.dataset.href });
    });
}

var manifest = chrome.runtime.getManifest();
document.querySelector(".title > p").textContent += " " + manifest.version;

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tabURL = new URL(tabs[0].url)
    var hostname = tabURL.hostname.replace("www.", "");
    var protocol = tabURL.protocol;
    if (protocol == "https:" || protocol == "http:") {
        chrome.storage.local.get('whitelist', function (result) {
            if (typeof result.whitelist !== "undefined" && result.whitelist != "") {
                function containsCommentSign(value) {
                    return value.indexOf("!") && value.indexOf("#") && value != "";
                }
                var whitelist = result.whitelist.split("\n").filter(containsCommentSign).join([separator = '|']);
                if (whitelist.includes(hostname)) {
                    document.querySelector(".switch").textContent = chrome.i18n.getMessage("popupEnable", hostname);
                    document.querySelector(".switch").addEventListener("click", function () {
                        chrome.storage.local.set({
                            whitelist: result.whitelist.replace(hostname, "").replace(/^\s*[\r\n]/gm, "").trim()
                        });
                        location.reload();
                    });
                }
                else {
                    document.querySelector(".switch").textContent = chrome.i18n.getMessage("popupDisable", hostname);
                    document.querySelector(".switch").addEventListener("click", function () {
                        chrome.storage.local.set({
                            whitelist: result.whitelist + "\n" + hostname
                        });
                        location.reload();
                    });
                }
            }
            else {
                document.querySelector(".switch").textContent = chrome.i18n.getMessage("popupDisable", hostname);
                document.querySelector(".switch").addEventListener("click", function () {
                    chrome.storage.local.set({
                        whitelist: hostname
                    });
                    location.reload();
                });
            }
        });
        document.querySelector(".wrapper-switch").style.display = "flex";
        document.querySelector(".separator-switch").style.display = "block";
    }
});
