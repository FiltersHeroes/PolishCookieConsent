function handleTextResponse(text, filterListID, updateNotification, flURL) {
    const obj = { content: text, sourceURL: flURL };
    const filterListLine = text.split("\n");
    for (var i = 0; i < filterListLine.length; i++) {
        if (filterListLine[i].match(/(!|#) Version/g)) {
            obj["version"] = filterListLine[i].split(":")[1].trim();
            break;
        }
    }

    PCC_vAPI.storage.local.get(filterListID).then(function (resultOldFL) {
        let oldVersion = "0";
        if (typeof resultOldFL !== "undefined" && resultOldFL != "") {
            oldVersion = JSON.parse(resultOldFL)["version"];
        }
        PCC_vAPI.storage.local.set(filterListID, JSON.stringify(obj)).then(function () {
            console.log("[Polish Cookie Consent] Fetched " + filterListID);
            if (updateNotification && oldVersion !== obj["version"]) {
                PCC_vAPI.storage.local.get("userSettings").then(function (userSettings) {
                    if (userSettings && JSON.parse(userSettings)["autoUpdateNotifications"]) {
                        PCC_vAPI.notifications.create(
                            "autoUpdatePCC",
                            PCC_vAPI.runtime.getURL("icons/icon48.png"),
                            PCC_vAPI.i18n.getMessage("extensionName"),
                            PCC_vAPI.i18n.getMessage("updateSuccess", new Array(PCC_vAPI.i18n.getMessage(filterListID)))
                        );
                    }
                });
            }
        });
    });
}

function setUpdateTime() {
    var _updateTime = Date.now() + 24 * 7 * 60 * 60 * 1000;
    PCC_vAPI.storage.local.set("updateTime", _updateTime).then(function () {
        updateCookieBase(_updateTime);
    });
}

function updateCookieBase(updateTime) {
    var interval = parseInt(updateTime) - Date.now();
    if (!interval) {
        return;
    }
    if (interval < 0) {
        interval = 10;
    }

    PCC_vAPI.runLater(interval, async function () {
        const userSettingsResult = await PCC_vAPI.storage.local.get("userSettings");
        if (!userSettingsResult) {
            return;
        }
        const userSettings = JSON.parse(userSettingsResult);
        if (!userSettings["autoUpdate"]) {
            return;
        }

        try {
            const aJSONresult = await PCC_vAPI.storage.local.get("assetsJSON");
            const aJSON = JSON.parse(aJSONresult);

            const response = await PCC_updateHelpers.fetchFromCdns(aJSON["assets.json"].cdnURLs);
            const assetsJSON = await response.json();
            await PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON));

            const sFLresult = await PCC_vAPI.storage.local.get("selectedFilterLists");
            const sFLnewResult = sFLresult.filter(item => item !== "userFilters");

            for (let selectedFL of sFLnewResult) {
                try {
                    const flResponse = await PCC_updateHelpers.fetchFromCdns(assetsJSON[selectedFL].cdnURLs);
                    const text = await flResponse.text();
                    handleTextResponse(text, selectedFL, true, flResponse.url);
                } catch (error) {
                    console.log(`[Polish Cookie Consent] Filterlist: ${selectedFL} Error: ${error}`);
                }
                await new Promise(res => setTimeout(res, 1000));
            }
        } catch (error) {
            console.log(`[Polish Cookie Consent] ${error}`);
            if (userSettings["autoUpdateNotifications"]) {
                PCC_vAPI.notifications.create(
                    "autoUpdatePCC",
                    PCC_vAPI.runtime.getURL("icons/icon48.png"),
                    PCC_vAPI.i18n.getMessage("extensionName"),
                    PCC_vAPI.i18n.getMessage("updateFail")
                );
            }
        }
        setUpdateTime();
    });
}

async function fetchLocalAssets() {
    try {
        const response = await PCC_updateHelpers.fetchWithRetry(PCC_vAPI.runtime.getURL("assets/assets.json"));
        const assetsJSON = await response.json();
        await PCC_vAPI.storage.local.set('assetsJSON', JSON.stringify(assetsJSON));

        const filterLists = Object.keys(assetsJSON).filter(item => item !== "assets.json");
        for (let localFL of filterLists) {
            try {
                const flResponse = await PCC_updateHelpers.fetchWithRetry(PCC_vAPI.runtime.getURL(assetsJSON[localFL].localURL));
                const text = await flResponse.text();
                handleTextResponse(text, localFL, false, assetsJSON[localFL].contentURL);
            } catch (error) {
                console.log(`[Polish Cookie Consent] ${error}`);
            }
        }
    } catch (error) {
        console.log(`[Polish Cookie Consent] ${error}`);
    }
    setUpdateTime();
}

async function setDefaultSettings() {
    const result = await PCC_vAPI.storage.local.get("cookieBase");
    if (typeof result !== "undefined" || result) {
        PCC_vAPI.storage.local.remove("cookieBase");
    }

    const response = await PCC_updateHelpers.fetchWithRetry(PCC_vAPI.runtime.getURL("controlPanel/defaultSettings.json"));
    const defaultSettings = await response.json();

    const sFLvalue = await PCC_vAPI.storage.local.get("selectedFilterLists");
    if (typeof sFLvalue == "undefined" || !sFLvalue) {
        await PCC_vAPI.storage.local.set("selectedFilterLists", defaultSettings["selectedFilterLists"]);
        const sValue = await PCC_vAPI.storage.local.get("userSettings");
        if (typeof sValue == "undefined" || !sValue) {
            await PCC_vAPI.storage.local.set("userSettings", JSON.stringify(defaultSettings["userSettings"]));
        }
    }
    await fetchLocalAssets();
}

PCC_vAPI.onFirstRunOrUpdate().then(async function (result) {
    if (result === "install" || result === "update") {
        await setDefaultSettings();
    }
});

PCC_vAPI.storage.local.get("updateTime").then(function (resultUpdateTime) {
    if (resultUpdateTime) {
        updateCookieBase(resultUpdateTime);
    }
});
