var PCC_overlay = {
    init: () => {
        const { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
        let prefService = Services.prefs;

        const basePrefPart = "extensions.PolishFiltersTeam.PCC.";

        // Add toolbar button to toolbar on first run
        if (prefService.getBoolPref(basePrefPart + "firstRunDone") == false) {
            let btn_id = "PolishFiltersTeam_PCC_btn";
            if (!document.getElementById(btn_id)) {
                var toolbar = document.getElementById("nav-bar");
                toolbar.insertItem(btn_id, null);
                toolbar.setAttribute("currentset", toolbar.currentSet);
                document.persist(toolbar.id, "currentset");
            }

            // Migrate Jetpack data
            Components.utils.import('resource://gre/modules/osfile.jsm');
            const jetpackFile = OS.Path.join(OS.Constants.Path.profileDir, "jetpack", "PolishCookieConsentExt@polishannoyancefilters.netlify.com", "simple-storage", "store.json");
            OS.File.exists(jetpackFile).then(function (exists) {
                if (exists) {
                    OS.File.read(jetpackFile, { encoding: "utf-8" }).then(function (data) {
                        const parsedD = JSON.parse(data, 'utf8');
                        PCC_vAPI.storage.local.set("lastOpenedTab", parsedD.lastOpenedTab).then(function () {
                            PCC_vAPI.storage.local.set("userFilters", parsedD.userFilters).then(function () {
                                PCC_vAPI.storage.local.set("whitelist", parsedD.whitelist).then(function () {
                                    PCC_vAPI_common.convertUFToNewSyntax();
                                });
                            });
                        });
                        const backupFile = OS.Path.join(OS.Constants.Path.profileDir, "jetpack", "PolishCookieConsentExt@polishannoyancefilters.netlify.com", "simple-storage", "store.json.migrated");
                        OS.File.move(jetpackFile, backupFile);
                        alert("[Polish Cookie Consent] Settings migration completed. If all is fine, then you can remove file '" + backupFile + "' now.");
                    });
                }
            });

            prefService.setBoolPref(basePrefPart + "firstRunDone", true);
        }

        // Remove extension preferences when uninstalling
        AddonManager.addAddonListener({
            onUninstalling: function (addon) {
                if (addon.id == "PolishCookieConsentExt@polishannoyancefilters.netlify.com") {
                    prefService.clearUserPref(basePrefPart + "firstRunDone");
                    prefService.clearUserPref(basePrefPart + "version");
                }
            }
        });

        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        let browserWindow = wm.getMostRecentWindow("navigator:browser");

        // Run content script in the context of web pages
        browserWindow.document.getElementById("appcontent").addEventListener("DOMDocElementInserted", function (e) {
            let win = e.originalTarget;
            if (win.ownerDocument) {
                win = win.ownerDocument;
            }
            if (win.defaultView) {
                win = win.defaultView;
            }
            let sandbox = Components.utils.Sandbox(browserWindow, {
                sameZoneAs: win.top,
                sandboxPrototype: win,
                wantXrays: true,
                wantComponents: false,
            });
            var PCC_vAPI = {
                storage: {
                    local: {
                        get: function (name) {
                            Components.utils.import('resource://gre/modules/osfile.jsm');
                            const file = OS.Path.join(OS.Constants.Path.profileDir, "extension-data", "PolishCookieConsentExt@polishannoyancefilters.netlify.com.json");
                            return new Promise(function (resolve, reject) {
                                OS.File.read(file, { encoding: "utf-8" }).then(function (data) {
                                    const parsedD = JSON.parse(data, 'utf8');
                                    resolve(parsedD[name]);
                                });
                            });
                        }
                    }
                }
            };
            sandbox.PCC_vAPI = Components.utils.cloneInto(PCC_vAPI, sandbox, { cloneFunctions: true });
            Services.scriptloader.loadSubScript("chrome://PCC/content/content.js", sandbox);
        }, true);
    },
    placePopup: () => {
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        let browserWindow = wm.getMostRecentWindow("navigator:browser");
        let ebtn = browserWindow.document.querySelector("#PolishFiltersTeam_PCC_btn");
        let epanel = browserWindow.document.querySelector("#PolishFiltersTeam_PCC_popup_panel");
        epanel.openPopup(ebtn, "after_end", 0, 0, false, false);

        PCC_vAPI.resizePopup();

        epanel.addEventListener("popuphiding", function () {
            ebtn.checked = false;
        });

        browserWindow.document.querySelector("#PolishFiltersTeam_PCC_popup_frame").contentWindow.postMessage({ what: 'tabURL', value: browserWindow.gBrowser.currentURI.spec }, "*");
    }
}

window.addEventListener("load", () => { PCC_overlay.init(); }, false);
