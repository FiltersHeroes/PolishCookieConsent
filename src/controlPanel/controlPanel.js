// Title
document.querySelector("title").textContent = chrome.i18n.getMessage("extensionName") + " - " + chrome.i18n.getMessage("controlPanel");

// Mobile menu
var sidedrawerEl = document.querySelector('#sidedrawer');

document.querySelector('.js-show-sidedrawer').addEventListener("click", function () {
    // Show overlay
    var overlayEl = mui.overlay('on');

    // Show element
    overlayEl.appendChild(sidedrawerEl);
    setTimeout(function () {
        sidedrawerEl.classList.add('active');
        var desktopTabs = document.querySelectorAll('.mui-tabs__bar li a');
        for (var i = 0; i < desktopTabs.length; i++) {
            desktopTabs[i].setAttribute("data-mui-controls", "");
        }
    }, 20);
});

document.querySelector('.js-hide-sidedrawer').addEventListener("click", function () {
    var bodyEl = document.querySelector('body');
    bodyEl.classList.remove('hide-sidedrawer');
    bodyEl.classList.remove('mui-scroll-lock');
    sidedrawerEl.classList.remove('active');
    mui.overlay('off');
});

// Save last opened tab ID
var tabs = document.querySelectorAll('[data-mui-toggle="tab"]');
for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
        chrome.storage.local.set({
            lastOpenedTab: this.getAttribute("data-mui-controls")
        });
    })
}

// Get last opened tab ID and open it
chrome.storage.local.get(['lastOpenedTab'], function (result) {
    if (result.lastOpenedTab) {
        mui.tabs.activate(result.lastOpenedTab);
        document.querySelector('.mobileMenu [data-mui-controls=' + result.lastOpenedTab + ']').parentNode.classList.add("mui--is-active");
    }
    else {
        var firstMobileTab = document.querySelectorAll('.mobileMenu li')[0];
        firstMobileTab.classList.add("mui--is-active");
        mui.tabs.activate(firstMobileTab.querySelector("a").getAttribute("data-mui-controls"));
    }
});

// Automatically adjust textareas height
var cookieBaseContent = document.getElementById("cookieBaseContent");
var userFilters = document.getElementById("userFilters");
var userWhitelist = document.getElementById("userWhitelist");
autosize(cookieBaseContent);
autosize(userFilters);
autosize(userWhitelist);

document.querySelector('.mui-tabs__bar [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userWhitelist);
})

document.querySelector('.mui-tabs__bar [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userFilters);
})

document.querySelector('#sidedrawer [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userWhitelist);
})

document.querySelector('#sidedrawer [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userFilters);
})

// Show version number of Polish Cookie Base
document.addEventListener("DOMContentLoaded", updateVersion);

function updateVersion() {
    chrome.storage.local.get(['cookieBase'], function (result) {
        if (result.cookieBase) {
            var cookieBaseLine = result.cookieBase.split("\n");
            for (var i = 0; i < cookieBaseLine.length; i++) {
                if (cookieBaseLine[i].match("Version")) {
                    var cBV = document.querySelector(".cBV");
                    cBV.textContent = cBV.textContent.split(':')[0] + ": " + cookieBaseLine[i].split(":")[1].trim();
                }
            }
        }
    });
}

// Manual update of Cookie Base
document.querySelector("#updateCookieBase").addEventListener("click", function () {
    var updateBtn = document.querySelector("button#updateCookieBase");
    function handleTextResponse(response) {
        return response.text()
            .then(text => {
                if (response.ok) {
                    chrome.storage.local.set({
                        cookieBase: text
                    });
                    cookieBaseContent.textContent = text;
                    updateVersion();
                    updateBtn.classList.remove("active");
                } else {
                    return Promise.reject({
                        status: response.status,
                        statusText: response.statusText,
                        err: text
                    })
                }
            })
    }
    updateBtn.classList.add("active");
    fetch('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt')
        .then(handleTextResponse)
        .catch(error => console.log(error));
})

// Show/hide Cookie Base
document.querySelector("#showCookieBase").addEventListener("click", function () {
    var toggleBtn = document.querySelector("button#showCookieBase");
    chrome.storage.local.get(['cookieBase'], function (result) {
        if (result.cookieBase && cookieBaseContent.textContent.length == 0) {
            cookieBaseContent.textContent = result.cookieBase;
            document.querySelector(".cookieBaseContent").style = "";
            cookieBaseContent.style.visibility = "";
            toggleBtn.querySelector("svg.hideCookieBase").removeAttribute("hidden");
            toggleBtn.querySelector("svg.showCookieBase").setAttribute("hidden", true);
            replaceI18n(toggleBtn.querySelector("span"), "__MSG_hideCookieBase__");
        }
        else if (cookieBaseContent.textContent.length > 0) {
            cookieBaseContent.textContent = "";
            cookieBaseContent.style.visibility = "hidden";
            toggleBtn.querySelector("svg.hideCookieBase").setAttribute("hidden", true);
            toggleBtn.querySelector("svg.showCookieBase").removeAttribute("hidden");
            replaceI18n(toggleBtn.querySelector("span"), "__MSG_showCookieBase__");
        }
        autosize.update(cookieBaseContent);
    });
})

// Add user filters to textarea
restoreUserFilters();
function restoreUserFilters() {
    chrome.storage.local.get(['userFilters'], function (result) {
        if (result.userFilters) {
            userFilters.value = result.userFilters;
        }
        else {
            userFilters.value = "";
        }
        autosize.update(userFilters);
    });
}

// Revert user filters text area to original value
var userFiltersRevert = document.getElementById("userFiltersRevert");
var userFiltersApply = document.getElementById("userFiltersApply");
userFiltersRevert.addEventListener("click", function () {
    restoreUserFilters();
    userFiltersRevert.disabled = true;
    userFiltersApply.disabled = true;
});

// Save user filters
document.querySelector("#my-filters form").addEventListener("submit", function (e) {
    e.preventDefault();
    chrome.storage.local.set({
        userFilters: userFilters.value
    });
    userFiltersApply.disabled = true;
    userFiltersRevert.disabled = true;
});

// Disable/enable submit and revert user filters buttons
userFilters.addEventListener('input', function () {
    chrome.storage.local.get(["userFilters"], function (result) {
        if (userFilters.value == result.userFilters) {
            userFiltersApply.disabled = true;
            userFiltersRevert.disabled = true;
        }
        else {
            userFiltersApply.disabled = false;
            userFiltersRevert.disabled = false;
        }
    });
});


// Add whitelist to textarea
restoreWhitelist();
function restoreWhitelist() {
    chrome.storage.local.get(['whitelist'], function (result) {
        if (result.whitelist) {
            userWhitelist.value = result.whitelist;
        }
        else {
            userWhitelist.value = "";
        }
        autosize.update(userWhitelist);
    });
}

// Revert whitelist text area to original value
var whitelistApply = document.getElementById("whitelistApply");
var whitelistRevert = document.getElementById("whitelistRevert");
whitelistRevert.addEventListener("click", function () {
    restoreWhitelist();
    whitelistRevert.disabled = true;
    whitelistApply.disabled = true;
});

// Save whitelist
document.querySelector("#whitelist form").addEventListener("submit", function (e) {
    e.preventDefault();
    chrome.storage.local.set({
        whitelist: userWhitelist.value
    });
    whitelistApply.disabled = true;
    whitelistRevert.disabled = true;
});

// Disable/enable submit and revert whitelist buttons
userWhitelist.addEventListener('input', function () {
    chrome.storage.local.get(["whitelist"], function (result) {
        if (userWhitelist.value == result.whitelist) {
            whitelistApply.disabled = true;
            whitelistRevert.disabled = true;
        }
        else {
            whitelistApply.disabled = false;
            whitelistRevert.disabled = false;
        }
    });
});

// Import user filters and whitelist
document.querySelector('#userFiltersImport').addEventListener('click', function () {
    importText("userFilters", "userFiltersApply", "userFiltersRevert");
});

document.querySelector('#whitelistImport').addEventListener('click', function () {
    importText("userWhitelist", "whitelistApply", "whitelistRevert");
});

function importText(textarea, applyButton, revertButton) {
    var fp = document.getElementById("importFilePicker");
    fp.addEventListener('change', function () {
        const file = fp.files[0];
        const fr = new FileReader();
        fr.onload = function (e) {
            if (document.getElementById(textarea).textLength > 0) {
                document.getElementById(textarea).value = [...new Set((document.getElementById(textarea).value + "\n" + fr.result).split(/[\n \t ' ']/))].join("\n");
            }
            else {
                document.getElementById(textarea).value = fr.result;
            }
            autosize.update(document.getElementById(textarea));
            document.getElementById(applyButton).disabled = false;
            document.getElementById(revertButton).disabled = false;
        }
        fr.readAsText(file);
    })
    fp.value = '';
    fp.click();
}

// Export user filters and whitelist
document.querySelector('#userFiltersExport').addEventListener('click', function () {
    exportText("userFilters", "myFilters");
});

document.querySelector('#whitelistExport').addEventListener('click', function () {
    exportText("userWhitelist", "whitelist");
});

function todayDate() {
    return new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().replace(/\.\d+Z$/, '').replace(/:/g, '.').replace('T', '_');
}

function exportText(field, fileNamePart) {
    // We need an iframe to workaround bug in Waterfox Classic/Firefox<63 on Linux (https://discourse.mozilla.org/t/bug-exporting-files-via-javascript/13116)
    var a = document.querySelector('iframe[src="exportFile.html"]').contentWindow.document.getElementById("download");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(document.getElementById(field).value);
    a.download = chrome.i18n.getMessage("extensionShortName") + "-" + chrome.i18n.getMessage(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt";
    a.click();
    a.href = "";
    a.download = "";
}

// Add extension version to about tab
document.querySelector("#about .extensionInfo").textContent = chrome.i18n.getMessage("extensionName") + " " + chrome.runtime.getManifest().version;
