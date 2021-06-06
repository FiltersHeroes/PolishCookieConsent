// Title
document.querySelector("title").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " - " + PCC_vAPI.i18n.getMessage("controlPanel");

// Mobile menu
var sidedrawerEl = document.querySelector('#sidedrawer');

document.querySelector('.js-show-sidedrawer').addEventListener("click", function () {
    // Show overlay
    var overlayEl = mui.overlay('on');

    // Show element
    overlayEl.appendChild(sidedrawerEl);
    setTimeout(function () {
        sidedrawerEl.classList.add('active');
        var desktopTabs = document.querySelectorAll('.mui-tabs__bar li a');
        for (var i = 0; i < desktopTabs.length; i++) {
            desktopTabs[i].setAttribute("data-mui-controls", "");
        }
    }, 20);
});

document.querySelector('.js-hide-sidedrawer').addEventListener("click", function () {
    var bodyEl = document.querySelector('body');
    bodyEl.classList.remove('hide-sidedrawer');
    bodyEl.classList.remove('mui-scroll-lock');
    sidedrawerEl.classList.remove('active');
    mui.overlay('off');
});

// Save last opened tab ID
var tabs = document.querySelectorAll('[data-mui-toggle="tab"]');
for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", function () {
        PCC_vAPI.storage.local.set("lastOpenedTab", this.getAttribute("data-mui-controls"));
    })
}

// Get last opened tab ID and open it
PCC_vAPI.storage.local.get('lastOpenedTab').then(function (resultLastOpenedTab) {
    if (resultLastOpenedTab) {
        mui.tabs.activate(resultLastOpenedTab);
        document.querySelector('.mobileMenu [data-mui-controls=' + resultLastOpenedTab + ']').parentNode.classList.add("mui--is-active");
    }
    else {
        var firstMobileTab = document.querySelectorAll('.mobileMenu li')[0];
        firstMobileTab.classList.add("mui--is-active");
        mui.tabs.activate(firstMobileTab.querySelector("a").getAttribute("data-mui-controls"));
    }
});

// Add extension version to about tab
const version = PCC_vAPI.getVersion();
document.querySelector("#about-tab .extensionInfo").textContent = PCC_vAPI.i18n.getMessage("extensionName") + " " + version;
document.querySelector("#changelog").href += "/v" + version;
