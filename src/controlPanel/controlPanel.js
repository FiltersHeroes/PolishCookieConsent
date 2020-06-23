// Title
const { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
const stringBundle = Services.strings.createBundle(document.querySelector("meta[stringbundle]").getAttribute("stringbundle"));
document.querySelector("title").textContent = stringBundle.GetStringFromName("extensionName") + " - " + stringBundle.GetStringFromName("controlPanel");

// Mobile menu
var sidedrawerEl = document.querySelector('#sidedrawer');
document.querySelector('.js-show-sidedrawer').addEventListener("click", function () {
    // show overlay
    var overlayEl = mui.overlay('on');

    // show element
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
    var bodyEl = document.body;
    bodyEl.classList.remove('hide-sidedrawer');
    bodyEl.classList.remove('mui-scroll-lock');
    sidedrawerEl.classList.remove('active');
    mui.overlay('off');
});

// Save last opened tab ID
var tabs = document.querySelectorAll('[data-mui-toggle="tab"]');
for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
        self.port.emit("saveLastOpenedTab", this.getAttribute("data-mui-controls"));
    })
}

// Get last opened tab ID and open it
self.port.on("getLastOpenedTab", function (lastOpenedTab) {
    if (lastOpenedTab) {
        mui.tabs.activate(lastOpenedTab);
        document.querySelector('.mobileMenu [data-mui-controls=' + lastOpenedTab + ']').parentNode.classList.add("mui--is-active");
    }
    else {
        var firstMobileTab = document.querySelectorAll('.mobileMenu li')[0];
        firstMobileTab.classList.add("mui--is-active");
        mui.tabs.activate(firstMobileTab.querySelector("a").getAttribute("data-mui-controls"));
    }
});

// Automatically adjust textareas height
var cookieBaseContent = document.getElementById("cookieBaseContent");
var userFiltersTa = document.getElementById("userFilters");
var userWhitelist = document.getElementById("userWhitelist");
autosize(cookieBaseContent);
autosize(userFiltersTa);
autosize(userWhitelist);

document.querySelector('.mui-tabs__bar [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userWhitelist);
})

document.querySelector('.mui-tabs__bar [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userFiltersTa);
})

document.querySelector('#sidedrawer [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userWhitelist);
})

document.querySelector('#sidedrawer [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
    autosize.update(userFiltersTa);
})

// Show version number of Polish Cookie Base
updateVersion();
function updateVersion() {
    self.port.on("getCookieBase", function (cookieBase) {
        var cookieBaseLine = cookieBase.split("\n");
        for (var i = 0; i < cookieBaseLine.length; i++) {
            if (cookieBaseLine[i].match("Version")) {
                var cBV = document.querySelector(".cBV");
                cBV.textContent = cBV.textContent.split(':')[0] + ": " + cookieBaseLine[i].split(":")[1].trim();
            }
        }
    });
}

// Manual update of Cookie Base
var updateBtn = document.getElementById("updateCookieBase");
updateBtn.addEventListener("click", function () {
    function handleTextResponse(response) {
        return response.text()
            .then(text => {
                if (response.ok) {
                    self.port.emit("updateCookieBase", text);
                    self.port.emit("updateCookieBase", text);
                    cookieBaseContent.textContent = text;
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
var toggleBtn = document.querySelector("#showCookieBase");
self.port.on("getCookieBase", function (cookieBase) {
    toggleBtn.addEventListener("click", function () {
        if (cookieBase && cookieBaseContent.textContent.length == 0) {
            cookieBaseContent.textContent = cookieBase;
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
    })
});


var userFiltersRevert = document.getElementById("userFiltersRevert");
var userFiltersApply = document.getElementById("userFiltersApply");
self.port.on("restoreFilters", function (userFilters) {
    // Add user filters to textarea
    if (userFilters) {
        userFiltersTa.value = userFilters;
        autosize.update(userFilters);
    }
    // Revert user filters text area to original value
    userFiltersRevert.addEventListener("click", function () {
        if (userFilters) {
            userFiltersTa.value = userFilters;
        }
        else {
            userFiltersTa.value = "";
        }
        userFiltersRevert.disabled = true;
        userFiltersApply.disabled = true;
        autosize.update(userFilters);
    });
});

// Save user filters
var userFiltersApply = document.getElementById("userFiltersApply");
document.querySelector("#my-filters form").addEventListener("submit", function (e) {
    e.preventDefault();
    self.port.emit("saveFilters", userFiltersTa.value);
    userFiltersApply.disabled = true;
    userFiltersRevert.disabled = true;
});


// Disable/enable submit and revert user filters buttons
self.port.on("restoreFilters", function (userFilters) {
    userFiltersTa.addEventListener('input', function () {
        if (userFiltersTa.value == userFilters) {
            userFiltersApply.disabled = true;
            userFiltersRevert.disabled = true;
        }
        else {
            userFiltersApply.disabled = false;
            userFiltersRevert.disabled = false;
        }
    });
});

var whitelistApply = document.getElementById("whitelistApply");
var whitelistRevert = document.getElementById("whitelistRevert");
self.port.on("restoreWhitelist", function (whitelist) {
    // Add whitelist to textarea
    if (whitelist) {
        userWhitelist.value = whitelist;
        autosize.update(userWhitelist);
    }
    // Revert whitelist text area to original value
    whitelistRevert.addEventListener("click", function () {
        if (whitelist) {
            userWhitelist.value = whitelist;
        }
        else {
            userWhitelist.value = "";
        }
        whitelistRevert.disabled = true;
        whitelistApply.disabled = true;
        autosize.update(userWhitelist);
    });
});

// Save whitelist
var whitelistApply = document.getElementById("whitelistApply");
document.querySelector("#whitelist form").addEventListener("submit", function (e) {
    e.preventDefault();
    self.port.emit("saveWhitelist", userWhitelist.value);
    whitelistApply.disabled = true;
    whitelistRevert.disabled = true;
});

// Disable/enable submit and revert whitelist buttons
self.port.on("restoreWhitelist", function (whitelist) {
    userWhitelist.addEventListener('input', function () {
        if (userWhitelist.value === whitelist) {
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
    const a = document.createElement('a');
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(document.getElementById(field).value);
    a.download = stringBundle.GetStringFromName("extensionShortName") + "-" + stringBundle.GetStringFromName(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt";
    a.dispatchEvent(new MouseEvent('click'));
}

// Add extension version to about tab
const { AddonManager } = Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.getAddonByID("PolishCookieConsentExt@polishannoyancefilters.netlify.com", function (addon) {
    document.querySelector("#about .extensionInfo").textContent = stringBundle.GetStringFromName("extensionName") + " " + addon.version;
});
