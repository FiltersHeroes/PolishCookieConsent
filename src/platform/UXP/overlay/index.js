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
            appcontent.addEventListener("DOMWindowCreated", function (e) {
                let win = e.originalTarget.defaultView;
                if (!win || !win.location || !/^https?:/.test(win.location.href)) {
                    return;
                }
                let sandbox = Components.utils.Sandbox(browserWindow, {
                    sameZoneAs: win.top,
                    sandboxPrototype: win,
                    wantXrays: true,
                    wantComponents: false,
                });
                const exposedMethods = {
                    storage: {
                        local: {
                            get: PCC_vAPI.storage.local.get.bind(PCC_vAPI.storage.local),
                        }
                    }
                };
                sandbox.PCC_vAPI = Components.utils.cloneInto(exposedMethods, sandbox, { cloneFunctions: true });
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
