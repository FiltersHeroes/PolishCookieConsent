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

            prefService.setBoolPref(basePrefPart + "firstRunDone", true);
        }

        // Set tooltip text for toolbar button
        const PCC_toolbar_btn = document.querySelector("#nav-bar #PolishFiltersTeam_PCC_btn");
        if (PCC_toolbar_btn) {
            PCC_toolbar_btn.setAttribute("tooltiptext", PCC_vAPI.i18n.getMessage("extensionName"));
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
        let appcontent = browserWindow.document.getElementById("appcontent");
        if (appcontent) {
            appcontent.addEventListener("DOMDocElementInserted", function (e) {
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
        }
    },
    placePopup: () => {
        let wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator);
        let browserWindow = wm.getMostRecentWindow("navigator:browser");
        let ebtn = browserWindow.document.querySelector("#PolishFiltersTeam_PCC_btn");
        if (!ebtn) {
            return;
        }

        let epanel = browserWindow.document.createElement("panel");
        epanel.id = "PolishFiltersTeam_PCC_popup_panel";
        epanel.setAttribute("hidden", "true");
        epanel.style.opacity = "0";

        let iframe = browserWindow.document.createElement("iframe");
        iframe.id = "PolishFiltersTeam_PCC_popup_frame";
        iframe.setAttribute("type", "content");
        iframe.setAttribute("flex", "1");
        iframe.setAttribute("src", "chrome://PCC/content/popup/index.html");

        epanel.appendChild(iframe);
        browserWindow.document.getElementById("mainPopupSet").appendChild(epanel);
        epanel.removeAttribute("hidden");

        let resizeTimer = null;
        function resizePopupDelayed(attempts = 0) {
            if (resizeTimer !== null) {
                return;
            }
            attempts++;
            if (attempts > 50) {
                return;
            }

            resizeTimer = setTimeout(() => {
                resizeTimer = null;

                if (!iframe.contentDocument?.body || !iframe.contentWindow) {
                    return;
                }
                let body = iframe.contentDocument.body;

                try {
                    iframe.contentWindow.setSwitch(browserWindow.gBrowser.currentURI.spec);
                } catch (e) {
                    console.error("setSwitch failed:", e);
                }

                if (iframe.clientHeight !== body.clientHeight || iframe.clientWidth !== body.clientWidth) {
                    resizePopupDelayed(attempts);
                }
            }, 10);
        }

        epanel.addEventListener("popupshown", () => {
            resizePopupDelayed();
        }, { once: true });

        epanel.addEventListener("popuphiding", () => {
            ebtn.checked = false;
            if (resizeTimer) {
                clearTimeout(resizeTimer);
                resizeTimer = null;
            }
            epanel.remove();
        }, { once: true });

        epanel.openPopup(ebtn, "after_end", 0, 0, false, false);
    }
}

window.addEventListener("load", () => { PCC_overlay.init(); }, false);
