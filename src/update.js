function handleTextResponse(response) {
    return response.text()
        .then(text => {
            if (response.ok) {
                PCC_vAPI.storage.local.set("cookieBase", text).then(function(){
                    PCC_vAPI.storage.local.get("autoUpdateNotificationsEnabled").then(function (autoUpdateNotificationsEnabled) {
                        if(autoUpdateNotificationsEnabled) {
                            PCC_vAPI.notifications.create("autoUpdatePCC", PCC_vAPI.runtime.getURL("icons/icon48.png"), PCC_vAPI.i18n.getMessage("extensionName"), PCC_vAPI.i18n.getMessage("updateSuccess", new Array(PCC_vAPI.i18n.getMessage("PolishCookieDatabase"))));
                        }
                    });
                });
            } else {
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    err: text
                })
            }
        })
}

function setUpdateTime() {
    var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;
    PCC_vAPI.storage.local.set("updateTime", _updateTime).then(function () {
        updateCookieBase(_updateTime);
    });
}

function updateCookieBase(updateTime) {
    var interval = parseInt(updateTime) - Date.now();
    if (interval) {
        if (interval < 0) {
            interval = 10;
        }
        setTimeout(function () {
            PCC_vAPI.storage.local.get("autoUpdateEnabled").then(function (autoUpdateEnabled) {
                if (autoUpdateEnabled) {
                    fetch("https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/cookieBase/PCB.txt")
                        .then(handleTextResponse)
                        .catch(function(error) {
                            console.log("[Polish Cookie Consent] "+error);
                            PCC_vAPI.storage.local.get("autoUpdateNotificationsEnabled").then(function (autoUpdateNotificationsEnabled) {
                                if(autoUpdateNotificationsEnabled) {
                                    PCC_vAPI.notifications.create("autoUpdatePCC", PCC_vAPI.runtime.getURL("icons/icon48.png"), PCC_vAPI.i18n.getMessage("extensionName"), PCC_vAPI.i18n.getMessage("updateFail", new Array(PCC_vAPI.i18n.getMessage("PolishCookieDatabase"))));
                                }
                            });
                        });
                }
                setUpdateTime();
            });
        }, interval);
    }
}

function fetchLocalCookieBase() {
    let cookieBaseURL;
    if (PCC_vAPI.isWebExtension() == true) {
        cookieBaseURL = "/cookieBase/PCB.txt";
    } else {
        cookieBaseURL = "chrome://PCC/content/cookieBase/PCB.txt";
    }
    fetch(cookieBaseURL)
        .then(handleTextResponse)
        .catch(error => console.log("[Polish Cookie Consent] "+error));
}

function setDefaultSettings() {
    const settings = ["userFiltersEnabled", "cookieBaseEnabled", "autoUpdateEnabled", "autoUpdateNotificationsEnabled"];
    settings.forEach((setting) => {
        PCC_vAPI.storage.local.get(setting).then(function (sValue) {
            if (!sValue) {
                PCC_vAPI.storage.local.set(setting, "true");
            }
        })
    });
}

PCC_vAPI.onFirstRunOrUpdate().then(function (result) {
    if (PCC_vAPI.isWebExtension() == true && result == "update") {
        setDefaultSettings();
        fetchLocalCookieBase();
        setUpdateTime();
        PCC_vAPI_common.convertUFToNewSyntax();
    }
    else if (result == "install" || result == "update") {
        setDefaultSettings();
        fetchLocalCookieBase();
        setUpdateTime();
    } else if (PCC_vAPI.isWebExtension() == false) {
        if (result == "nothing") {
            PCC_vAPI.storage.local.get("updateTime").then(function (resultUpdateTime) {
                if (resultUpdateTime) {
                    updateCookieBase(resultUpdateTime);
                }
            });
        }
    }
});

if (PCC_vAPI.isWebExtension() == true) {
    PCC_vAPI.storage.local.get("updateTime").then(function (resultUpdateTime) {
        if (resultUpdateTime) {
            updateCookieBase(resultUpdateTime);
        }
    });
}
