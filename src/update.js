/*******************************************************************************
    Copyright (C) 2021 Filters Heroes
    This file is part of Polish Cookie Consent.

    Polish Cookie Consent is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Polish Cookie Consent is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Polish Cookie Consent. If not, see {http://www.gnu.org/licenses/}.
*/

function handleTextResponse(text, filterListID, updateNotification) {
    PCC_vAPI.storage.local.set(filterListID, text).then(function () {
        if (updateNotification) {
            PCC_vAPI.storage.local.get("userSettings").then(function (userSettings) {
                if (userSettings) {
                    if (JSON.parse(userSettings)["autoUpdateNotifications"]) {
                        PCC_vAPI.notifications.create("autoUpdatePCC", PCC_vAPI.runtime.getURL("icons/icon48.png"), PCC_vAPI.i18n.getMessage("extensionName"), PCC_vAPI.i18n.getMessage("updateSuccess", new Array(PCC_vAPI.i18n.getMessage(filterListID))));
                    }
                }
            });
        } else {
            console.log("[Polish Cookie Consent] Fetched " + filterListID);
        }
    });
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
            PCC_vAPI.storage.local.get("userSettings").then(function (userSettingsResult) {
                if (userSettingsResult) {
                    const userSettings = JSON.parse(userSettingsResult);
                    if (userSettings["autoUpdate"]) {
                        PCC_vAPI.storage.local.get("assetsJSON").then(function (aJSONresult) {
                            const aJSON = JSON.parse(aJSONresult);
                            fetch(aJSON["assets.json"].contentURL[0])
                                .then(response => {
                                    if (!response.ok) {
                                        return Promise.reject({
                                            status: response.status,
                                            statusText: response.statusText,
                                            err: response.statusText
                                        })
                                    }
                                    return response.json();
                                })
                                .then(assetsJSON => {
                                    PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON));
                                    PCC_vAPI.storage.local.get("selectedFilterLists").then(function (sFLresult) {
                                        const sFLnewResult = sFLresult.filter(item => item !== "userFilters");
                                        sFLnewResult.reduce(async (seq, selectedFL) => {
                                            await seq;
                                            fetch(assetsJSON[selectedFL].contentURL[0])
                                                .then(response => {
                                                    if (!response.ok) {
                                                        return Promise.reject({
                                                            status: response.status,
                                                            statusText: response.statusText,
                                                            err: response.statusText
                                                        })
                                                    }
                                                    return response.text();
                                                })
                                                .then(text => {
                                                    handleTextResponse(text, selectedFL, true);
                                                })
                                                .catch(function (error) {
                                                    console.log("[Polish Cookie Consent] " + error);
                                                    if (userSettings["autoUpdateNotifications"]) {
                                                        PCC_vAPI.notifications.create("autoUpdatePCC", PCC_vAPI.runtime.getURL("icons/icon48.png"), PCC_vAPI.i18n.getMessage("extensionName"), PCC_vAPI.i18n.getMessage("updateFail", new Array(PCC_vAPI.i18n.getMessage(selectedFL))));
                                                    }
                                                });
                                            return await new Promise(res => setTimeout(res, 1000));
                                        }, Promise.resolve());
                                    });
                                })
                                .catch(function (error) {
                                    console.log("[Polish Cookie Consent] " + error);
                                });
                        });
                    }
                }
            }).then(function () {
                setUpdateTime();
            });
        }, interval);
    }
}

function fetchLocalAssets() {
    fetch(PCC_vAPI.runtime.getURL("assets/assets.json"))
        .then(response => {
            if (!response.ok) {
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    err: response.statusText
                })
            }
            return response.json();
        })
        .then(assetsJSON => {
            PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON)).then(function () {
                const filerLists = Object.keys(assetsJSON).filter(item => item !== "assets.json");
                filerLists.reduce(async (seq, localFL) => {
                    await seq;
                    fetch(PCC_vAPI.runtime.getURL(assetsJSON[localFL].contentURL[1]))
                        .then(response => {
                            if (!response.ok) {
                                return Promise.reject({
                                    status: response.status,
                                    statusText: response.statusText,
                                    err: response.statusText
                                });
                            }
                            return response.text();
                        })
                        .then(text => {
                            handleTextResponse(text, localFL, false);
                        })
                        .catch(error => console.log("[Polish Cookie Consent] " + error));
                    return await new Promise(res => setTimeout(res, 1000));
                }, Promise.resolve());
            });
        })
        .catch(error => console.log("[Polish Cookie Consent] " + error));
    setUpdateTime();
}

function setDefaultSettings() {
    PCC_vAPI.storage.local.get("cookieBase").then(function (result) {
        if (typeof result !== "undefined" || result) {
            PCC_vAPI.storage.local.remove("cookieBase");
        }
    }).then(function () {
        fetch(PCC_vAPI.runtime.getURL("controlPanel/defaultSettings.json"))
            .then(response => {
                if (!response.ok) {
                    return Promise.reject({
                        status: response.status,
                        statusText: response.statusText,
                        err: response.statusText
                    })
                }
                return response.json();
            }).then(defaultSettings => {
                PCC_vAPI.storage.local.get("selectedFilterLists").then(function (sFLvalue) {
                    if (typeof sFLvalue == "undefined" || !sFLvalue) {
                        PCC_vAPI.storage.local.set("selectedFilterLists", defaultSettings["selectedFilterLists"]).then(function () {
                            PCC_vAPI.storage.local.get("userSettings").then(function (sValue) {
                                if (typeof sValue == "undefined" || !sValue) {
                                    PCC_vAPI.storage.local.set("userSettings", JSON.stringify(defaultSettings["userSettings"])).then(function () {
                                        fetchLocalAssets();
                                    });
                                }
                            })
                        });
                    }
                });
            })
            .catch(function (error) {
                console.log("[Polish Cookie Consent] " + error);
            });
    });
}

PCC_vAPI.onFirstRunOrUpdate().then(function (result) {
    if (result == "install" || result == "update") {
        setDefaultSettings();
    }
});

PCC_vAPI.storage.local.get("updateTime").then(function (resultUpdateTime) {
    if (resultUpdateTime) {
        updateCookieBase(resultUpdateTime);
    }
});
