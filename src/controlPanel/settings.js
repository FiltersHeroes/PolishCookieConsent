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
    result.forEach((filterList) => {
        document.querySelector('#' + filterList + ' input[type="checkbox"]').checked = true;
    });
});


// Show version number of all filter lists
document.addEventListener("DOMContentLoaded", updateVersion);

function updateVersion() {
    document.querySelectorAll('.database:not(#myFilters)').forEach((filterList) => {
        PCC_vAPI.storage.local.get(filterList.id).then(function (result) {
            if (result) {
                var filterListLine = result.split("\n");
                for (var i = 0; i < filterListLine.length; i++) {
                    if (filterListLine[i].match("Version")) {
                        var fLV = document.querySelector("#" + filterList.id + " #version");
                        fLV.textContent = fLV.textContent.split(':')[0] + ": " + filterListLine[i].split(":")[1].trim();
                    }
                }
            }
        });
    });
}

// Manual update of filter lists
document.querySelector("#updateCookieBase").addEventListener("click", function () {
    var updateBtn = document.querySelector("button#updateCookieBase");
    updateBtn.classList.add("active");

    PCC_vAPI.storage.local.get('assetsJSON').then(function (resultAssets) {
        if (resultAssets) {
            const localAssetsJSON = JSON.parse(resultAssets);
            const jsonURL = localAssetsJSON["assets.json"].contentURL[0];
            fetch(jsonURL)
                .then(response => {
                    if (!response.ok) {
                        return Promise.reject({
                            status: response.status,
                            statusText: response.statusText,
                            err: text
                        })
                    }
                    return response.json();
                })
                .then(assetsJSON => {
                    PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON));
                    const selectedFilterLists = getSelectedFilterLists().filter(item => item !== "userFilters");
                    selectedFilterLists.reduce(async (seq, selectedFL) => {
                        await seq;
                        fetch(assetsJSON[selectedFL].contentURL[0])
                            .then(response => {
                                if (!response.ok) {
                                    return Promise.reject({
                                        status: response.status,
                                        statusText: response.statusText,
                                        err: text
                                    })
                                }
                                return response.text();
                            })
                            .then(text => {
                                PCC_vAPI.storage.local.set(selectedFL, text).then(function (){
                                    updateBtn.classList.remove("active");
                                    updateVersion();
                                });
                            })
                            .catch(error => console.log(error));
                        return await new Promise(res => setTimeout(res, 1000));
                    }, Promise.resolve());
                })
                .catch(error => console.log(error));
        }
    });
});
