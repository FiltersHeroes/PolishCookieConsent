/*******************************************************************************
    Copyright (C) 2025 Filters Heroes
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

// Save color scheme choice
let colorSchemeToggle = document.querySelector("#darkTheme_toggle");
let rootH = document.querySelector(":root");
colorSchemeToggle.addEventListener('change', function () {
    let colorScheme;
    if (this.checked) {
        colorScheme = "dark";
        rootH.classList.add("dark");
        rootH.setAttribute("theme", "dark");
    } else {
        colorScheme = "light";
        if (rootH.classList.contains("dark")) {
            rootH.classList.remove("dark");
        }
        rootH.setAttribute("theme", "light");
    }
    PCC_vAPI.storage.local.set("colorScheme", colorScheme);
    PCC_vAPI.storage.local.setCache("colorScheme", colorScheme);
    let colorEvent = new CustomEvent("colorSchemeChange", {
        detail: { currentColorScheme: colorScheme }
    });
    document.dispatchEvent(colorEvent);
});


// Save auto-update settings
// Is auto-update enabled?
let autoUpdateToggle = document.querySelector('#autoUpdate_toggle');
let autoUpdateNotificationsToggle = document.querySelector("#notificationsUpdate_toggle");
autoUpdateToggle.addEventListener('change', function () {
    PCC_vAPI.storage.local.get("userSettings").then(function (resultUS) {
        if (resultUS) {
            const userSettings = JSON.parse(resultUS);
            userSettings["autoUpdate"] = autoUpdateToggle.checked;
            PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings)).then(function () {
                if (autoUpdateToggle.checked) {
                    PCC_vAPI.storage.local.set("updateTime", new Date().getTime() + 24 * 7 * 60 * 60 * 1000);
                    autoUpdateNotificationsToggle.removeAttribute("disabled");
                } else {
                    autoUpdateNotificationsToggle.disabled = "true";
                }
            });
        }
    });
});

// Are auto-update notifications enabled?
autoUpdateNotificationsToggle.addEventListener('change', function () {
    PCC_vAPI.storage.local.get("userSettings").then(function (resultUS) {
        const userSettings = JSON.parse(resultUS);
        userSettings["autoUpdateNotifications"] = autoUpdateNotificationsToggle.checked;
        PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings));
    });
});

// Load user settings
PCC_vAPI.storage.local.get("userSettings").then(function (resultUS) {
    if (resultUS) {
        const userSettings = JSON.parse(resultUS);
        autoUpdateToggle.checked = userSettings["autoUpdate"];
        if (!autoUpdateToggle.checked) {
            autoUpdateNotificationsToggle.disabled = "true";
        }
        autoUpdateNotificationsToggle.checked = userSettings["autoUpdateNotifications"];
    }
});

// Get currently selected names of filter lists
function getSelectedFilterLists() {
    let selectedFilterLists = [];
    document.querySelectorAll('.database input[type="checkbox"]:checked').forEach((selectedFL) => {
        selectedFilterLists.push(selectedFL.id.replace("_toggle", ""));
    });
    return selectedFilterLists;
}

// Enable/disable filterlists
document.querySelectorAll('.database input[type="checkbox"]').forEach((filterlist) => {
    filterlist.addEventListener('change', () => {
        PCC_vAPI.storage.local.set("selectedFilterLists", getSelectedFilterLists());
    });
});
PCC_vAPI.storage.local.get("selectedFilterLists").then(function (result) {
    if (result) {
        result.forEach((filterList) => {
            document.querySelector('#' + filterList + ' input[type="checkbox"]').checked = true;
        });
    }
});


// Show version number and links of all filter lists
document.addEventListener("DOMContentLoaded", updateDetails);

function updateDetails() {
    document.querySelectorAll('.database:not(#userFilters)').forEach((filterList) => {
        PCC_vAPI.storage.local.get(filterList.id).then(function (result) {
            if (result) {
                var fLV = document.querySelector("#" + filterList.id + " #version");
                fLV.textContent = fLV.textContent.split(':')[0] + ": " + JSON.parse(result)["version"];
                PCC_vAPI.storage.local.get('assetsJSON').then(function (resultAssets) {
                    if (resultAssets) {
                        const localAssetsJSON = JSON.parse(resultAssets);
                        filterList.querySelector("#supportURL").href = localAssetsJSON[filterList.id].supportURL;
                        const supportEmail = localAssetsJSON[filterList.id].supportEmail;
                        if (supportEmail) {
                            filterList.querySelector("#supportEmail").href = "mailto:" + supportEmail.replace(" at ", "@").replace(new RegExp(" dot ", 'g'), ".");
                            filterList.querySelector("#supportEmail").removeAttribute("hidden");
                        }
                    }
                });
            }
        });
    });
}

// Manual update of filter lists
document.querySelector("#updateCookieBase").addEventListener("click", async function () {
    var updateBtn = document.querySelector("button#updateCookieBase");
    updateBtn.classList.add("active");

    var resultAssets = await PCC_vAPI.storage.local.get('assetsJSON');
    if (resultAssets) {
        const localAssetsJSON = JSON.parse(resultAssets);
        const jsonURLs = localAssetsJSON["assets.json"].cdnURLs;
        const response = await fetchFromCdns(jsonURLs);
        const assetsJSON = await response.json();
        await PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON));
        const neededFilterLists = getSelectedFilterLists().filter(item => item !== "userFilters");
        for (let neededFilterList of neededFilterLists) {
            try {
                const filterlistResponse = await fetchFromCdns(assetsJSON[neededFilterList].cdnURLs);
                const text = await filterlistResponse.text();
                const obj = {};
                obj["content"] = text;
                obj["sourceURL"] = filterlistResponse.url;
                const filterListLine = text.split("\n");
                for (var i = 0; i < filterListLine.length; i++) {
                    if (filterListLine[i].match(/(!|#) Version/g)) {
                        obj["version"] = filterListLine[i].split(":")[1].trim();
                        break;
                    }
                }
                await PCC_vAPI.storage.local.set(neededFilterList, JSON.stringify(obj));
            } catch (error) {
                console.log(`[Polish Cookie Consent] Filterlist: ${neededFilterList} Error: ${error}`);
            }
            await new Promise(res => setTimeout(res, 1000));
        }
        updateBtn.classList.remove("active");
        updateDetails();
    }
});

// Create a backup
document.querySelector("#createBackup").addEventListener("click", function () {
    const obj = {};
    const tStamp = Date.now();
    const eVersion = PCC_vAPI.getVersion();

    obj["timeStamp"] = tStamp;
    obj["version"] = eVersion;

    PCC_vAPI.storage.local.get("userSettings").then(function (resultUS) {
        PCC_vAPI.storage.local.get("userFilters").then(function (resultUF) {
            PCC_vAPI.storage.local.get("whitelist").then(function (resultEL) {
                obj["userSettings"] = JSON.parse(resultUS);
                obj["selectedFilterLists"] = getSelectedFilterLists();
                if (resultUF) {
                    obj["userFilters"] = resultUF;
                } else {
                    obj["userFilters"] = "";
                }
                if (resultEL) {
                    obj["whitelist"] = resultEL;
                } else {
                    obj["whitelist"] = "";
                }
                // We need an iframe to workaround bug in Waterfox Classic/Firefox<63 on Linux (https://discourse.mozilla.org/t/bug-exporting-files-via-javascript/13116)
                var a = document.querySelector('iframe[src="exportFile.html"]').contentWindow.document.getElementById("download");
                a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
                a.download = PCC_vAPI.i18n.getMessage("backupFilename", new Array(todayDate())) + ".json";
                a.click();
                a.href = "";
                a.download = "";
                PCC_vAPI.storage.local.set("lastBackupTime", tStamp).then(function () {
                    showLastBackupTime();
                });
            });
        });
    });
});

// Show info about last backup
function showLastBackupTime() {
    PCC_vAPI.storage.local.get("lastBackupTime").then(function (result) {
        if (result) {
            const timeOptions = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                timeZoneName: 'short'
            };
            document.querySelector("#lastBackupPrompt").textContent = PCC_vAPI.i18n.getMessage("lastBackupPrompt") + " " + new Date(result).toLocaleString(PCC_vAPI.i18n.getUILanguage(), timeOptions);
            document.querySelector("#lastBackupPrompt").removeAttribute("hidden");
        }
    });
}
showLastBackupTime();

// Restore settings from file
document.querySelector("#restoreSettings").addEventListener("click", function () {
    var fp = document.getElementById("restoreFilePicker");
    fp.onchange = function () {
        const file = fp.files[0];
        if (file === undefined || file.name === '') { return; }

        const fr = new FileReader();
        fr.onload = function () {
            const fResult = fr.result;
            let jsonR = JSON.parse(fResult);
            const userSettings = jsonR["userSettings"];
            const selectedFilterLists = jsonR["selectedFilterLists"];
            const userFilters = jsonR["userFilters"];
            const excludedList = jsonR["whitelist"];
            try {
                if (typeof jsonR !== "object") {
                    throw 'Invalid';
                }
                if (typeof userSettings !== "object" ||
                    typeof userFilters !== "string" ||
                    typeof excludedList !== "string") {
                    throw 'Invalid';
                }
                if (Array.isArray(selectedFilterLists) === false) {
                    throw 'Invalid';
                }
            }
            catch (e) {
                jsonR = undefined;
            }
            finally {
                if (jsonR === undefined) {
                    window.alert(PCC_vAPI.i18n.getMessage('restoreSettingsError'));
                    return;
                } else {
                    const proceed = window.confirm(PCC_vAPI.i18n.getMessage("restoreSettingsConfirm", new Array(new Date(jsonR["timeStamp"]).toLocaleString())));
                    if (proceed !== true) {
                        return;
                    }
                    PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings)).then(function () {
                        PCC_vAPI.storage.local.set("selectedFilterLists", selectedFilterLists).then(function () {
                            PCC_vAPI.storage.local.set("userFilters", userFilters).then(function () {
                                PCC_vAPI.storage.local.set("whitelist", excludedList).then(function () {
                                    PCC_vAPI.runtime.reload();
                                });
                            })
                        });
                    });
                }
            }
        }
        fr.readAsText(file);
    };
    fp.value = '';
    fp.click();
});

// Make factory reset
document.querySelector("#factoryReset").addEventListener("click", function () {
    const proceed = window.confirm(PCC_vAPI.i18n.getMessage("factoryResetConfirm"));
    if (proceed !== true) {
        return;
    }
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
            PCC_vAPI.storage.local.set("selectedFilterLists", defaultSettings["selectedFilterLists"]).then(function () {
                PCC_vAPI.storage.local.set("userSettings", JSON.stringify(defaultSettings["userSettings"])).then(function () {
                    PCC_vAPI.storage.local.set("userFilters", "").then(function () {
                        PCC_vAPI.storage.local.set("whitelist", "").then(function () {
                            PCC_vAPI.storage.local.set("lastBackupTime", "").then(function () {
                                PCC_vAPI.storage.local.set("colorScheme", "").then(function () {
                                    PCC_vAPI.runtime.reload();
                                });
                            });
                        });
                    });
                });
            });
        })
        .catch(function (error) {
            console.log("[Polish Cookie Consent] " + error);
        });
});
