var content = document.body;
var size = {};
size.width = content.offsetWidth;
size.height = content.offsetHeight;
self.port.emit("resize", size);

var wrapper = document.querySelectorAll(".wrapper:not(.wrapper-switch)");

for (var i = 0; i < wrapper.length; i++) {
  wrapper[i].addEventListener('click', function (event) {
    window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIWebNavigation)
      .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
      .rootTreeItem
      .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
      .getInterface(Components.interfaces.nsIDOMWindow).gBrowser.loadOneTab(this.dataset.href, { inBackground: false });
  });
}

const { AddonManager } = Components.utils.import("resource://gre/modules/AddonManager.jsm");
AddonManager.getAddonByID("PolishCookieConsentExt@polishannoyancefilters.netlify.com", function (addon) {
  document.querySelector(".title > p").textContent += " " + addon.version;
});

const { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
const stringBundle = Services.strings.createBundle(document.querySelector("meta[stringbundle]").getAttribute("stringbundle"));

self.port.on("getActiveTabURL", function (activeTabURL) {
  var tabURL = new URL(activeTabURL);
  var hostname = tabURL.hostname.replace("www.", "");
  var protocol = tabURL.protocol;
  if (protocol == "https:" || protocol == "http:") {
    self.port.on("getWhitelist", function (resultWhitelist) {
      if (typeof resultWhitelist !== "undefined" && resultWhitelist != "") {
        var whitelist = resultWhitelist.split("\n").join([separator = '|']);
        if (whitelist.includes(hostname)) {
          document.querySelector(".switch").textContent = stringBundle.GetStringFromName("popupEnable").replace("$HOSTNAME$", hostname);
          document.querySelector(".switch").addEventListener("click", function () {
            self.port.emit("removeFromWhitelist", hostname);
          });
        }
        else {
          document.querySelector(".switch").textContent = stringBundle.GetStringFromName("popupDisable").replace("$HOSTNAME$", hostname);
          document.querySelector(".switch").addEventListener("click", function () {
            self.port.emit("addToWhitelist", hostname);
          });
        }
      }
      else {
        document.querySelector(".switch").textContent = stringBundle.GetStringFromName("popupDisable").replace("$HOSTNAME$", hostname);
        document.querySelector(".switch").addEventListener("click", function () {
          self.port.emit("addToWhitelist", hostname);
        });
      }
      document.querySelector(".wrapper-switch").style.display = "flex";
      document.querySelector(".separator-switch").style.display = "block";
      size.width = content.offsetWidth + 5;
      size.height = content.offsetHeight + 5;
      self.port.emit("resize", size);
    });
  }
  else {
    location.reload();
  }
});
