// Title
document.querySelector("title").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " - " + PCC_vAPI.i18n.getMessage("controlPanel");

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
        PCC_vAPI.storage.local.set("lastOpenedTab", this.getAttribute("data-mui-controls"));
    })
}

// Get last opened tab ID and open it
PCC_vAPI.storage.local.get('lastOpenedTab').then(function (resultLastOpenedTab) {
    if (resultLastOpenedTab) {
        mui.tabs.activate(resultLastOpenedTab);
        document.querySelector('.mobileMenu [data-mui-controls=' + resultLastOpenedTab + ']').parentNode.classList.add("mui--is-active");
    }
    else {
        var firstMobileTab = document.querySelectorAll('.mobileMenu li')[0];
        firstMobileTab.classList.add("mui--is-active");
        mui.tabs.activate(firstMobileTab.querySelector("a").getAttribute("data-mui-controls"));
    }
});


// Automatically adjust textareas height
var cookieBaseContent = document.getElementById("cookieBaseContent");
autosize(cookieBaseContent);


// Show version number of Polish Cookie Base
document.addEventListener("DOMContentLoaded", updateVersion);

function updateVersion() {
    PCC_vAPI.storage.local.get('cookieBase').then(function (resultCookieBase) {
        if (resultCookieBase) {
            var cookieBaseLine = resultCookieBase.split("\n");
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
                    PCC_vAPI.storage.local.set("cookieBase", text);
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
    fetch('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/cookieBase/PCB.txt')
        .then(handleTextResponse)
        .catch(error => console.log(error));
})

// Show/hide Cookie Base
document.querySelector("#showCookieBase").addEventListener("click", function () {
    var toggleBtn = document.querySelector("button#showCookieBase");
    PCC_vAPI.storage.local.get('cookieBase').then(function (resultCookieBase) {
        if (resultCookieBase && cookieBaseContent.textContent.length == 0) {
            cookieBaseContent.textContent = resultCookieBase;
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

// Define CodeMirror mode for user filters
CodeMirror.defineSimpleMode("filters", {
    // The start state contains the rules that are initially used
    start: [
        {
            regex: /#.*/,
            token: 'comment',
        },
        {
            regex: /!.*/,
            token: 'comment'
        },
    ],
    meta: {
        lineComment: "#"
    }
});

// Add user filters to textarea
var userFilters = new CodeMirror(document.querySelector('#userFilters'), {
    autofocus: true,
    autoRefresh: true,
    extraKeys: {
        "Ctrl-/": function (cm) {
            cm.toggleComment();
        }
    },
    gutters: ['CodeMirror-linenumbers'],
    lineNumbers: true,
    lineWrapping: true,
    mode: "filters",
    viewportMargin: Infinity
});
restoreUserFilters();
function restoreUserFilters() {
    PCC_vAPI.storage.local.get('userFilters').then(function (resultUserFilters) {
        if (resultUserFilters) {
            userFilters.setValue(resultUserFilters);
        }
        else {
            userFilters.setValue("");
        }
    }).then(function () {
        userFilters.refresh();
    });
}

// Revert user filters text area to original value
var userFiltersRevert = document.getElementById("userFiltersRevert");
var userFiltersApply = document.getElementById("userFiltersApply");
userFiltersRevert.addEventListener("click", function () {
    restoreUserFilters();
});

// Save user filters
let cachedUserFilters = '';
document.querySelector("#userFiltersApply").addEventListener("click", function () {
    // Strip duplicates from user filters
    userFilters.setValue([...new Set(userFilters.getValue().toString().split("\n"))].join("\n").trim());

    cachedUserFilters = userFilters.getValue();
    PCC_vAPI.storage.local.set("userFilters", cachedUserFilters);
});

// Disable/enable submit and revert user filters buttons
userFilters.on('changes', function () {
    PCC_vAPI.storage.local.get("userFilters").then(function (resultUserFilters) {
        if (cachedUserFilters != '') {
            resultUserFilters = cachedUserFilters;
            cachedUserFilters = '';
        }
        if (userFilters.getValue() == resultUserFilters) {
            userFiltersApply.disabled = true;
            userFiltersRevert.disabled = true;
        }
        else {
            userFiltersApply.disabled = false;
            userFiltersRevert.disabled = false;
        }
    });
});

// Define CodeMirror mode for excluded list
CodeMirror.defineSimpleMode("excludedList", {
    // The start state contains the rules that are initially used
    start: [
        {
            regex: /#.*/,
            token: 'comment'
        },
        {
            regex: /!.*/,
            token: 'comment'
        },
    ],
    meta: {
        lineComment: "#"
    }
});

// Add excluded list to textarea
var userWhitelist = new CodeMirror(document.querySelector('#userWhitelist'), {
    autofocus: true,
    autoRefresh: true,
    extraKeys: {
        "Ctrl-/": function (cm) {
            cm.toggleComment();
        }
    },
    gutters: ['CodeMirror-linenumbers'],
    lineNumbers: true,
    lineWrapping: true,
    mode: "excludedList",
    viewportMargin: Infinity
});
restoreWhitelist();
function restoreWhitelist() {
    PCC_vAPI.storage.local.get('whitelist').then(function (resultWhitelist) {
        if (resultWhitelist) {
            userWhitelist.setValue(resultWhitelist);
        }
        else {
            userWhitelist.setValue("");
        }
    }).then(function () {
        userWhitelist.refresh();
    });
}

// Revert whitelist text area to original value
var whitelistApply = document.getElementById("whitelistApply");
var whitelistRevert = document.getElementById("whitelistRevert");
whitelistRevert.addEventListener("click", function () {
    restoreWhitelist();
});

// Save whitelist
let cachedWhitelist = '';
document.querySelector("#whitelistApply").addEventListener("click", function () {
    // Strip duplicates and not allowed characters from whitelist
    userWhitelist.setValue([...new Set(userWhitelist.getValue().replace(/[^\w\s\.!\-#]/gi, '').split("\n"))].join("\n").trim());

    cachedWhitelist = userWhitelist.getValue();
    PCC_vAPI.storage.local.set("whitelist", cachedWhitelist);
});

// Disable/enable submit and revert whitelist buttons
userWhitelist.on('changes', function () {
    PCC_vAPI.storage.local.get("whitelist").then(function (resultWhitelist) {
        if (cachedWhitelist != '') {
            resultWhitelist = cachedWhitelist;
            cachedWhitelist = '';
        }
        if (userWhitelist.getValue() == resultWhitelist) {
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
    importText(userFilters);
});

document.querySelector('#whitelistImport').addEventListener('click', function () {
    importText(userWhitelist);
});

function importText(textarea) {
    var fp = document.getElementById("importFilePicker");
    fp.addEventListener('change', function () {
        const file = fp.files[0];
        const fr = new FileReader();
        fr.onload = function (e) {
            if (textarea.getValue().length > 0) {
                textarea.setValue([...new Set((textarea.getValue() + "\n" + fr.result).split("\n"))].join("\n"));
            }
            else {
                textarea.setValue(fr.result);
            }
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
    a.download = PCC_vAPI.i18n.getMessage("extensionShortName") + "-" + PCC_vAPI.i18n.getMessage(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt";
    a.click();
    a.href = "";
    a.download = "";
}

// Add extension version to about tab
document.querySelector("#about .extensionInfo").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " " + PCC_vAPI.getVersion();
