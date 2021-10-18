/*******************************************************************************
    Copyright (C) 2021 Filters Heroes
    This file is part of Polish Cookie Consent.

    Polish Cookie Consent is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Polish Cookie Consent is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Polish Cookie Consent. If not, see {http://www.gnu.org/licenses/}.
*/

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
    if (protocol == "https:" || protocol == "http:") {
        PCC_vAPI.storage.local.get('whitelist').then(function (resultWhitelist) {
            var switchBtn = document.querySelector(".switch");
            if (typeof resultWhitelist !== "undefined" && resultWhitelist != "") {
                function addWhitelist(btn) {
                    PCC_vAPI.storage.local.set("whitelist", resultWhitelist + "\n" + hostname);
                    btn.textContent = PCC_vAPI.i18n.getMessage("popupEnable");
                    btn.onclick = function() { removeWhitelist(btn); };
                }
                function removeWhitelist(btn) {
                    PCC_vAPI.storage.local.set("whitelist", resultWhitelist.replace(hostname, "").replace(/^\s*[\r\n]/gm, "").trim());
                    btn.textContent = PCC_vAPI.i18n.getMessage("popupDisable");
                    btn.onclick = function() { addWhitelist(btn); };
                }
                function containsCommentSign(value) {
                    return value.indexOf("!") && value.indexOf("#") && value != "";
                }
                var whitelist = resultWhitelist.split("\n").filter(containsCommentSign).join([separator = '|']);
                if (whitelist.includes(hostname)) {
                    switchBtn.textContent = PCC_vAPI.i18n.getMessage("popupEnable");
                    switchBtn.onclick = function() { removeWhitelist(switchBtn); };
                }
                else {
                    document.querySelector(".switch").textContent = PCC_vAPI.i18n.getMessage("popupDisable");
                    switchBtn.onclick = function() { addWhitelist(switchBtn); };
                }
            }
            else {
                function addWhitelist(btn) {
                    PCC_vAPI.storage.local.set("whitelist", hostname);
                    btn.textContent = PCC_vAPI.i18n.getMessage("popupEnable");
                    btn.onclick = function() { removeWhitelist(btn); };
                }
                function removeWhitelist(btn) {
                    PCC_vAPI.storage.local.set("whitelist", "");
                    btn.textContent = PCC_vAPI.i18n.getMessage("popupDisable");
                    btn.onclick = function() { addWhitelist(btn); };
                }
                switchBtn.textContent = PCC_vAPI.i18n.getMessage("popupDisable");
                switchBtn.onclick = function() { addWhitelist(switchBtn); };
            }
            document.querySelector(".wrapper-switch").style.display = "flex";
            document.querySelector(".separator-switch").style.display = "block";
            if(PCC_vAPI.isWebExtension() == false) {
                PCC_vAPI.resizePopup();
            }
        });
    }
    else {
        document.querySelector(".wrapper-switch").style.display = "none";
        document.querySelector(".separator-switch").style.display = "none";
        if(PCC_vAPI.isWebExtension() == false) {
            PCC_vAPI.resizePopup();
        }
    }
}

if(PCC_vAPI.isWebExtension() == true) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        setSwitch(tabs[0].url);
    });
} else {
    window.onmessage = function (e) {
        const msg = e.data;
        let aTabURL;
        if (msg.what == "tabURL") {
            aTabURL = msg.value;
        }
        setSwitch(aTabURL);
    }
}
