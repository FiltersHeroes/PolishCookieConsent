var sidenavInstance = M.Sidenav.init(document.querySelector(".sidenav"));
var mobileTabsInstance = M.Tabs.init(document.querySelector(".sidenav")); 
var tabsInstance = M.Tabs.init(document.querySelector(".tabs")); 

// Title
document.querySelector("title").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " - " + PCC_vAPI.i18n.getMessage("controlPanel");

// Save last opened tab ID
var allTabs = document.querySelectorAll('.tab a');
if (allTabs) {
    allTabs.forEach(tab => {
        tab.addEventListener("click", function () {
            PCC_vAPI.storage.local.set("lastOpenedTab", this.getAttribute("href").replace("#", ""));
        })
    });
}


// Get last opened tab ID and open it
PCC_vAPI.storage.local.get('lastOpenedTab').then(function (resultLastOpenedTab) {
    if (!window.location.hash && resultLastOpenedTab) {
        let lastOpenedTab = resultLastOpenedTab;
        if (lastOpenedTab == "cookie-base") {
            lastOpenedTab = "settings-tab";
        }
        else if (lastOpenedTab == "my-filters") {
            lastOpenedTab = "my-filters-tab";
        }
        else if (lastOpenedTab == "whitelist") {
            lastOpenedTab = "excluded-list-tab";
        }
        else if (lastOpenedTab == "about") {
            lastOpenedTab = "about-tab";
        }
        PCC_vAPI.storage.local.set("lastOpenedTab", lastOpenedTab);
        tabsInstance.select(lastOpenedTab); 
        mobileTabsInstance.select(lastOpenedTab);
    }
});

// Add URLs to Polish docs
let keySE = document.querySelector("#my-filters-tab .keyboardS");
let keyS2E = document.querySelector("#excluded-list-tab .keyboardS");
let syntaxE = document.querySelector("#my-filters-tab .syntax");
let privacyPolicy = document.querySelector("#about-tab .privacyPolicy");
if (PCC_vAPI.i18n.getUILanguage() == "pl") {
    keySE.href = keySE.href.replace("/en", "");
    keyS2E.href = keyS2E.href.replace("/en", "");
    syntaxE.href = syntaxE.href.replace("/en", "");
    privacyPolicy.href = privacyPolicy.href.replace("/en", "");
}

// Add extension version to about tab
const version = PCC_vAPI.getVersion();
document.querySelector("#about-tab .extensionInfo").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " " + version;
document.querySelector("#changelog").href += "/v" + version;
