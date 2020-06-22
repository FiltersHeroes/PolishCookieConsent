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
                    updateBtn.classList.remove("active");
                    location.reload();
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
self.port.on("getCookieBase", function (cookieBase) {
    var toggleBtn = document.querySelector("#showCookieBase");
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

// Add user filters to textarea
restoreFilters();
function restoreFilters() {
    self.port.on("restoreFilters", function (userFilters) {
        if (userFilters) {
            userFiltersTa.value = userFilters;
        }
    });
}

// Save user filters
var userFiltersApply = document.getElementById("userFiltersApply");
document.querySelector("#my-filters form").addEventListener("submit", function (e) {
    e.preventDefault();
    self.port.emit("saveFilters", userFiltersTa.value);
    userFiltersApply.disabled = true;
});


// Disable/enable submit user filters button
self.port.on("restoreFilters", function (userFilters) {
    userFiltersTa.addEventListener('input', function () {
        if (userFiltersTa.value == userFilters) {
            userFiltersApply.disabled = true;
        }
        else {
            userFiltersApply.disabled = false;
        }
    });
});

// Add whitelist to textarea
restoreWhitelist();
function restoreWhitelist() {
    self.port.on("restoreWhitelist", function (whitelist) {
        if (whitelist) {
            userWhitelist.value = whitelist;
        }
        autosize.update(userWhitelist);
    });
}

// Save whitelist
var whitelistApply = document.getElementById("whitelistApply");
document.querySelector("#whitelist form").addEventListener("submit", function (e) {
    e.preventDefault();
    self.port.emit("saveWhitelist", userWhitelist.value);
    whitelistApply.disabled = true;
});


// Disable/enable submit whitelist button
self.port.on("restoreWhitelist", function (whitelist) {
    userWhitelist.addEventListener('input', function () {
        if (userWhitelist.value === whitelist) {
            whitelistApply.disabled = true;
        }
        else {
            whitelistApply.disabled = false;
        }
    });
});

// Add extension version to about tab
const { AddonManager } = Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.getAddonByID("PolishCookieConsentExt@polishannoyancefilters.netlify.com", function (addon) {
    document.querySelector("#about .extensionInfo").textContent = stringBundle.GetStringFromName("extensionName") + " " + addon.version;
});
