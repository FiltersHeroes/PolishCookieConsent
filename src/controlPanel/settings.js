(async function () {
    "use strict";

    let colorSchemeToggle = document.querySelector("#darkTheme_toggle");
    let autoUpdateToggle = document.querySelector('#autoUpdate_toggle');
    let autoUpdateNotificationsToggle = document.querySelector("#notificationsUpdate_toggle");

    // Load user settings
    var resultUS = await PCC_vAPI.storage.local.get("userSettings");
    if (resultUS) {
        const userSettings = JSON.parse(resultUS);
        autoUpdateToggle.checked = userSettings["autoUpdate"];
        if (!autoUpdateToggle.checked) {
            autoUpdateNotificationsToggle.disabled = "true";
        }
        autoUpdateNotificationsToggle.checked = userSettings["autoUpdateNotifications"];
        let currentColorScheme = "auto";
        let savedColorScheme = userSettings["colorScheme"];
        if (savedColorScheme) {
            currentColorScheme = savedColorScheme;
        }
        colorSchemeToggle.value = currentColorScheme;
    }
    M.FormSelect.init(colorSchemeToggle);

    // Save color scheme choice
    colorSchemeToggle.addEventListener('change', async function () {
        let colorSchemeValue = this.value;
        let colorScheme = "light";
        if (colorSchemeValue != "auto") {
            colorScheme = colorSchemeValue;
        }
        else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            colorScheme = "dark";
        }
        let rootH = document.querySelector(":root");
        rootH.setAttribute("theme", colorScheme);

        var resultUS = await PCC_vAPI.storage.local.get("userSettings");
        if (resultUS) {
            const userSettings = JSON.parse(resultUS);
            userSettings["colorScheme"] = colorSchemeValue;
            await PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings));
        }
        PCC_vAPI.storage.local.setCache("colorScheme", colorSchemeValue);
        let colorEvent = new CustomEvent("colorSchemeChange", {
            detail: { currentColorScheme: colorScheme }
        });
        document.dispatchEvent(colorEvent);
    });


    // Save auto-update settings
    // Is auto-update enabled?
    autoUpdateToggle.addEventListener('change', async function () {
        var resultUS = await PCC_vAPI.storage.local.get("userSettings");
        if (resultUS) {
            const userSettings = JSON.parse(resultUS);
            userSettings["autoUpdate"] = autoUpdateToggle.checked;
            await PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings));
            if (autoUpdateToggle.checked) {
                PCC_vAPI.storage.local.set("updateTime", new Date().getTime() + 24 * 7 * 60 * 60 * 1000);
                autoUpdateNotificationsToggle.removeAttribute("disabled");
            } else {
                autoUpdateNotificationsToggle.disabled = "true";
            }
        }
    });

    // Are auto-update notifications enabled?
    autoUpdateNotificationsToggle.addEventListener('change', async function () {
        var resultUS = await PCC_vAPI.storage.local.get("userSettings");
        if (resultUS) {
            const userSettings = JSON.parse(resultUS);
            userSettings["autoUpdateNotifications"] = autoUpdateNotificationsToggle.checked;
            PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings));
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

    let selectedFilterListsResult = await PCC_vAPI.storage.local.get("selectedFilterLists");
    if (selectedFilterListsResult) {
        selectedFilterListsResult.forEach((filterList) => {
            document.querySelector('#' + filterList + ' input[type="checkbox"]').checked = true;
        });
    }

    function updateDetails() {
        document.querySelectorAll('.database:not(#userFilters)').forEach(async (filterList) => {
            var result = await PCC_vAPI.storage.local.get(filterList.id);
            if (result) {
                var fLV = document.querySelector("#" + filterList.id + " #version");
                fLV.textContent = fLV.textContent.split(':')[0] + ": " + JSON.parse(result)["version"];
                var resultAssets = await PCC_vAPI.storage.local.get('assetsJSON');
                if (resultAssets) {
                    const localAssetsJSON = JSON.parse(resultAssets);
                    filterList.querySelector("#supportURL").href = localAssetsJSON[filterList.id].supportURL;
                    const supportEmail = localAssetsJSON[filterList.id].supportEmail;
                    if (supportEmail) {
                        filterList.querySelector("#supportEmail").href = "mailto:" + supportEmail.replace(" at ", "@").replace(new RegExp(" dot ", 'g'), ".");
                        filterList.querySelector("#supportEmail").removeAttribute("hidden");
                    }
                }
            }
        });
    }

    // Show version number and links of all filter lists
    updateDetails();

    // Manual update of filter lists
    document.querySelector("#updateCookieBase").addEventListener("click", async function () {
        var updateBtn = document.querySelector("button#updateCookieBase");
        updateBtn.classList.add("active");

        var resultAssets = await PCC_vAPI.storage.local.get('assetsJSON');
        if (resultAssets) {
            const localAssetsJSON = JSON.parse(resultAssets);
            const jsonURLs = localAssetsJSON["assets.json"].cdnURLs;
            const response = await PCC_updateHelpers.fetchFromCdns(jsonURLs);
            const assetsJSON = await response.json();
            await PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON));
            const neededFilterLists = getSelectedFilterLists().filter(item => item !== "userFilters");
            for (let neededFilterList of neededFilterLists) {
                try {
                    const filterlistResponse = await PCC_updateHelpers.fetchFromCdns(assetsJSON[neededFilterList].cdnURLs);
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
    document.querySelector("#createBackup").addEventListener("click", async function () {
        const obj = {};
        const tStamp = Date.now();
        const eVersion = PCC_vAPI.getVersion();

        obj["timeStamp"] = tStamp;
        obj["version"] = eVersion;
        obj["userSettings"] = "";
        obj["userFilters"] = "";
        obj["whitelist"] = "";
        obj["selectedFilterLists"] = getSelectedFilterLists();

        var resultUS = await PCC_vAPI.storage.local.get("userSettings");
        var resultUF = await PCC_vAPI.storage.local.get("userFilters");
        var resultEL = await PCC_vAPI.storage.local.get("whitelist");

        if (resultUS) {
            obj["userSettings"] = JSON.parse(resultUS);
        }
        if (resultUF) {
            obj["userFilters"] = resultUF;
        }
        if (resultEL) {
            obj["whitelist"] = resultEL;
        }

        // We need an iframe to workaround bug in Waterfox Classic/Firefox<63 on Linux (https://discourse.mozilla.org/t/bug-exporting-files-via-javascript/13116)
        var a = document.querySelector('iframe[src="exportFile.html"]').contentWindow.document.getElementById("download");
        a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
        a.download = PCC_vAPI.i18n.getMessage("backupFilename", new Array(todayDate())) + ".json";
        a.click();
        a.href = "";
        a.download = "";
        await PCC_vAPI.storage.local.set("lastBackupTime", tStamp);
        await showLastBackupTime();
    });

    // Show info about last backup
    async function showLastBackupTime() {
        var result = await PCC_vAPI.storage.local.get("lastBackupTime");
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
    }
    await showLastBackupTime();

    // Restore settings from file
    document.querySelector("#restoreSettings").addEventListener("click", function () {
        var fp = document.getElementById("restoreFilePicker");
        fp.onchange = function () {
            const file = fp.files[0];
            if (file === undefined || file.name === '') { return; }

            const fr = new FileReader();
            fr.onload = async function () {
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
                        await PCC_vAPI.storage.local.set("userSettings", JSON.stringify(userSettings));
                        await PCC_vAPI.storage.local.set("selectedFilterLists", selectedFilterLists);
                        await PCC_vAPI.storage.local.set("userFilters", userFilters);
                        await PCC_vAPI.storage.local.set("whitelist", excludedList);
                        await PCC_vAPI.runtime.reload();
                    }
                }
            }
            fr.readAsText(file);
        };
        fp.value = '';
        fp.click();
    });

    // Make factory reset
    document.querySelector("#factoryReset").addEventListener("click", async function () {
        const proceed = window.confirm(PCC_vAPI.i18n.getMessage("factoryResetConfirm"));
        if (proceed !== true) {
            return;
        }
        try {
            var response = await fetch(PCC_vAPI.runtime.getURL("controlPanel/defaultSettings.json"));
            if (!response.ok) {
                throw {
                    status: response.status,
                    statusText: response.statusText,
                    err: response.statusText
                };
            }
            var defaultSettings = await response.json();
            if (defaultSettings) {
                await PCC_vAPI.storage.local.set("selectedFilterLists", defaultSettings["selectedFilterLists"]);
                await PCC_vAPI.storage.local.set("userSettings", JSON.stringify(defaultSettings["userSettings"]));
                await PCC_vAPI.storage.local.set("userFilters", "");
                await PCC_vAPI.storage.local.set("whitelist", "");
                await PCC_vAPI.storage.local.set("lastBackupTime", "");
                PCC_vAPI.runtime.reload();
            }
        }
        catch (error) {
            console.log("[Polish Cookie Consent] " + error);
        };
    });
})();
