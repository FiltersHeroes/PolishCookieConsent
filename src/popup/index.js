const version = PCC_vAPI.getVersion();
document.querySelector(".title > p").textContent += " " + version;

const wrapper = document.querySelectorAll(".wrapper:not(.wrapper-switch)");

for (let i = 0; i < wrapper.length; i++) {
    wrapper[i].addEventListener('click', function () {
        PCC_vAPI.tabs.create(this.dataset.href);
        PCC_vAPI.hidePopup();
    });
}

function setSwitch(url) {
    let tabURL = new URL(url);
    let hostname = tabURL.hostname.replace("www.", "");
    let protocol = tabURL.protocol;

    let wrapperSwitch = document.querySelector(".wrapper-switch");
    let separatorSwitch = document.querySelector(".separator-switch");
    if (protocol !== "https:" && protocol !== "http:") {
        wrapperSwitch.style.display = "none";
        separatorSwitch.style.display = "none";
        if (!PCC_vAPI.isWebExtension()) {
            PCC_vAPI.resizePopup();
        }
        return;
    }
    PCC_vAPI.storage.local.get('whitelist').then(function (resultWhitelist) {
        var switchBtn = document.querySelector(".switch");
        let whitelistValue = resultWhitelist || "";

        function addWhitelist() {
            var whitelistLines = whitelistValue.split("\n");
            whitelistLines.push(hostname);
            let newValue = whitelistLines.sort().join("\n");
            PCC_vAPI.storage.local.set("whitelist", newValue);
            switchBtn.textContent = PCC_vAPI.i18n.getMessage("popupEnable");
            switchBtn.onclick = removeWhitelist;
        }

        function removeWhitelist() {
            var whitelistLines = whitelistValue.split("\n").filter(line => line.trim() !== "" && line !== hostname).sort();
            let newValue = whitelistLines.join("\n");
            PCC_vAPI.storage.local.set("whitelist", newValue);
            switchBtn.textContent = PCC_vAPI.i18n.getMessage("popupDisable");
            switchBtn.onclick = addWhitelist;
        }

        function containsCommentSign(value) {
            return value && value.indexOf("!") === -1 && value.indexOf("#") === -1;
        }

        let whitelist = whitelistValue.split("\n").filter(containsCommentSign).join('|');
        if (whitelist.includes(hostname)) {
            switchBtn.textContent = PCC_vAPI.i18n.getMessage("popupEnable");
            switchBtn.onclick = removeWhitelist;
        }
        else {
            switchBtn.textContent = PCC_vAPI.i18n.getMessage("popupDisable");
            switchBtn.onclick = addWhitelist;
        }

        wrapperSwitch.style.display = "flex";
        separatorSwitch.style.display = "block";
        if (!PCC_vAPI.isWebExtension()) {
            PCC_vAPI.resizePopup();
        }
    });
}


if (PCC_vAPI.isWebExtension() === true) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        setSwitch(tabs[0].url);
    });
}
