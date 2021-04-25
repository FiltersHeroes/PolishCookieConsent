var PCC_vAPI = {
    isWebExtension: () => {
        return false;
    },
    getVersion: () => {
        let { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
        let prefService = Services.prefs;
        return prefService.getCharPref("extensions.PolishFiltersTeam.PCC.version");
    },
    i18n: {
        getMessage: (messageName, subs) => {
            const { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
            let translated;
            if (typeof subs !== 'undefined' && subs !== "") {
                translated = Services.strings.createBundle("chrome://PCC/locale/messages.properties").formatStringFromName(messageName, subs, subs.length);
            } else {
                translated = Services.strings.createBundle("chrome://PCC/locale/messages.properties").GetStringFromName(messageName);
            }
            return translated;
        },
        getUILanguage: () => {
            const xulChromeReg = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService().QueryInterface(Components.interfaces.nsIXULChromeRegistry);
            const selectedLocale = xulChromeReg.getSelectedLocale("pcc");
            return selectedLocale;
        }
    },
    tabs: {
        create: (url) => {
            const browserWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
            if (url.indexOf("..") > -1) {
                url = url.replace("..", "chrome://PCC/content");
            }
            browserWindow.gBrowser.loadOneTab(url, { inBackground: false });
        }
    },
    storage: {
        local: {
            set: (name, value) => {
                Components.utils.import('resource://gre/modules/osfile.jsm');
                const path = OS.Path.join(OS.Constants.Path.profileDir, "extension-data");
                OS.File.makeDir(path, { unixMode: parseInt('0774', 8) });
                const file = OS.Path.join(path, "PolishCookieConsentExt@polishannoyancefilters.netlify.com.json");

                return new Promise(function (resolve, reject) {
                    OS.File.exists(file).then(function (exists) {
                        if (exists) {
                            OS.File.read(file, { encoding: "utf-8" }).then(function (existingData) {
                                const parsedED = JSON.parse(existingData, 'utf8');
                                parsedED[name] = value;
                                resolve(OS.File.writeAtomic(file, JSON.stringify(parsedED)));
                            });
                        }
                        else {
                            const obj = {};
                            obj[name] = value;
                            resolve(OS.File.writeAtomic(file, JSON.stringify(obj)));
                        }
                    });
                });
            },
            get: (name) => {
                Components.utils.import('resource://gre/modules/osfile.jsm');
                const file = OS.Path.join(OS.Constants.Path.profileDir, "extension-data", "PolishCookieConsentExt@polishannoyancefilters.netlify.com.json");
                return new Promise(function (resolve, reject) {
                    OS.File.read(file, { encoding: "utf-8" }).then(function (data) {
                        const parsedD = JSON.parse(data, 'utf8');
                        resolve(parsedD[name]);
                    }).catch(err => {
                        console.log(err);
                    });
                });
            }
        }
    },
    onFirstRunOrUpdate: () => {
        let { AddonManager } = Components.utils.import("resource://gre/modules/AddonManager.jsm");
        let { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
        let prefService = Services.prefs;
        return new Promise(function (resolve, reject) {
            AddonManager.getAddonByID("PolishCookieConsentExt@polishannoyancefilters.netlify.com", function (addon) {
                var currentVersion = addon.version;
                var isNewVersion = Services.vc.compare(currentVersion, prefService.getCharPref("extensions.PolishFiltersTeam.PCC.version"));
                if (isNewVersion == 1) {
                    prefService.setCharPref("extensions.PolishFiltersTeam.PCC.version", currentVersion);
                    resolve("update");
                } else {
                    resolve("nothing");
                }
            });
        });
    },
    hidePopup: () => {
        var browserWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
        var epanel = browserWindow.document.querySelector("#PolishFiltersTeam_PCC_popup_panel");
        epanel.hidePopup();
    }

}
