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
                let path = OS.Path.join(OS.Constants.Path.profileDir, "extension-data");
                let file = OS.Path.join(path, "PolishCookieConsentExt@polishannoyancefilters.netlify.com.json");

                return new Promise(function (resolve, reject) {
                    OS.File.read(file, { encoding: "utf-8" }).then(function (data) {
                        const parsedED = JSON.parse(data, 'utf8');
                        parsedED[name] = value;
                        resolve(OS.File.writeAtomic(file, JSON.stringify(parsedED)));
                    }).catch(err => {
                        if (err instanceof OS.File.Error && err.becauseNoSuchFile) {
                            const obj = {};
                            obj[name] = value;
                            OS.File.makeDir(path, { unixMode: parseInt('0774', 8) });
                            OS.File.writeAtomic(file, JSON.stringify(obj));
                            resolve(undefined);
                        } else {
                            reject(err);
                        }
                    });
                });
            },
            get: (name) => {
                Components.utils.import('resource://gre/modules/osfile.jsm');
                let path = OS.Path.join(OS.Constants.Path.profileDir, "extension-data");
                let file = OS.Path.join(path, "PolishCookieConsentExt@polishannoyancefilters.netlify.com.json");

                return new Promise(function (resolve, reject) {
                    OS.File.read(file, { encoding: "utf-8" }).then(function (data) {
                        const parsedD = JSON.parse(data, 'utf8');
                        resolve(parsedD[name]);
                    }).catch(err => {
                        if (err instanceof OS.File.Error && err.becauseNoSuchFile) {
                            const obj = {};
                            OS.File.makeDir(path, { unixMode: parseInt('0774', 8) });
                            OS.File.writeAtomic(file, JSON.stringify(obj));
                            resolve(undefined);
                        } else {
                            reject(new Error(err));
                        }
                    });
                });
            },
            remove: (name) => {
                Components.utils.import('resource://gre/modules/osfile.jsm');
                let path = OS.Path.join(OS.Constants.Path.profileDir, "extension-data");
                let file = OS.Path.join(path, "PolishCookieConsentExt@polishannoyancefilters.netlify.com.json");

                return new Promise(function (resolve, reject) {
                    OS.File.read(file, { encoding: "utf-8" }).then(function (data) {
                        const parsedED = JSON.parse(data, 'utf8');
                        delete parsedED[name];
                        resolve(OS.File.writeAtomic(file, JSON.stringify(parsedED)));
                    }).catch(err => {
                        reject(new Error(err));
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
    },
    resizePopup: () => {
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        let browserWindow = wm.getMostRecentWindow("navigator:browser");
        let eframe = browserWindow.document.querySelector("#PolishFiltersTeam_PCC_popup_frame");
        let eframeHeight = eframe.contentDocument.body.scrollHeight;
        let eframeWidth = eframe.contentDocument.body.scrollWidth;
        let epanel = browserWindow.document.querySelector("#PolishFiltersTeam_PCC_popup_panel");
        epanel.style.height = eframe.style.height = eframeHeight + 1 + "px";
        epanel.style.width = eframe.style.width = eframeWidth + 1 + "px";
    },
    runtime: {
        getURL: (path) => {
            return "chrome://PCC/content/" + path;
        }
    },
    notifications: {
        create: (id, iconURL, title, message) => {
            const alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
            try {
                alertsService.showAlertNotification(iconURL,
                    title, message,
                    false, "", null, id);
            } catch (e) {
                // This can fail on Mac OS X
                console.log(e);
            }
        }
    }
}
