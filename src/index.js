var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage");
var tabs = require('sdk/tabs');


// Nasty hack based on source code from sdk/self.js
// https://gist.github.com/urig/828ddc85e3fd0b79327e
// Thanks for https://gist.github.com/urig

const options = require('@loader/options');
const { get } = require("sdk/preferences/service");
const { readURISync } = require('sdk/net/url');
const id = options.id;
const readPref = key => get("extensions." + id + ".sdk." + key);
const name = readPref("name") || options.name;
const baseURI = readPref("baseURI") || options.prefixURI + name + "/"
const uri = (path = "") =>
  path.includes(":") ? path : baseURI + path.replace(/^\.\//, "");
var self = Object.freeze({
  url: uri,
  load: function read(path) {
    return readURISync(uri(path));
  }
});
// End of nasty hack


var Request = require("sdk/request").Request;
var getCookieBase = Request({
  url: "chrome://pcc/content/PCB.txt",
  overrideMimeType: "text/plain; charset=utf-8",
  onComplete: function (response) {
    ss.storage.cookieBase = response.text;
  }
});

if (!ss.storage.cookieBase) {
  getCookieBase.get();
}


pageMod.PageMod({
  include: "*",
  contentScriptWhen: "start",
  contentScriptFile: self.url("content.js"),
  onAttach: function (worker) {
    if (ss.storage.whitelist) {
      worker.port.emit("getWhitelist", ss.storage.whitelist);
    }
    else {
      worker.port.emit("getWhitelist", "null");
    }
    if (ss.storage.userFilters) {
      worker.port.emit("getUserFilters", ss.storage.userFilters);
    }
    worker.port.emit("getCookieBase", ss.storage.cookieBase);
  }
});

pageMod.PageMod({
  include: "chrome://pcc/content/controlPanel/controlPanel.html",
  contentScriptFile: self.url("controlPanel/controlPanel.js"),
  contentScriptWhen: "ready",
  onAttach: function (worker) {
    worker.port.on('saveLastOpenedTab', function (lastOpenedTab) {
      ss.storage.lastOpenedTab = lastOpenedTab;
    });
    worker.port.emit("getLastOpenedTab", ss.storage.lastOpenedTab);
    worker.port.emit("restoreFilters", ss.storage.userFilters);
    worker.port.on('saveFilters', function (userFilters) {
      ss.storage.userFilters = userFilters;
      worker.port.emit("restoreFilters", ss.storage.userFilters);
    });
    worker.port.emit("restoreWhitelist", ss.storage.whitelist);
    worker.port.on('saveWhitelist', function (whitelist) {
      ss.storage.whitelist = whitelist;
      worker.port.emit("restoreWhitelist", ss.storage.whitelist);
    });
    worker.port.emit("getCookieBase", ss.storage.cookieBase);
    worker.port.on('updateCookieBase', function (cookieBase) {
      ss.storage.cookieBase = cookieBase;
      worker.port.emit("getCookieBase", ss.storage.cookieBase);
    });
  }
});


var { ToggleButton } = require('sdk/ui/button/toggle');
var sdkPanels = require("sdk/panel");

var button = ToggleButton({
  id: "PCC",
  label: "Polish Cookie Consent",
  icon: {
    "16": "chrome://PCC/content/icons/icon16.png",
    "32": "chrome://PCC/content/icons/icon32.png",
    "48": "chrome://PCC/content/icons/icon48.png",
    "64": "chrome://PCC/content/icons/icon64.png",
    "96": "chrome://PCC/content/icons/icon96.png",
    "128": "chrome://PCC/content/icons/icon128.png"
  },
  onChange: handleChange
});

var myPanel = sdkPanels.Panel({
  contentURL: "chrome://pcc/content/popup/index.html",
  contentScriptFile: self.url("popup/index.js"),
  contentScriptWhen: "ready",
  onHide: handleHide
});


function handleChange(state) {
  if (state.checked) {
    myPanel.port.on("resize", function (size) {
      myPanel.resize(size.width, size.height);
    });
    myPanel.show({
      position: button
    });
    myPanel.port.emit("getActiveTabURL", tabs.activeTab.url);
    myPanel.port.on('removeFromWhitelist', function (hostname) {
      ss.storage.whitelist = previousWhitelist.replace(hostname, "").replace(/^\s*[\r\n]/gm, "").trim();
      myPanel.hide();
    });
    const previousWhitelist = ss.storage.whitelist;
    myPanel.port.on('addToWhitelist', function (hostname) {
      if (previousWhitelist) {
        ss.storage.whitelist = previousWhitelist + "\n" + hostname;
      }
      else {
        ss.storage.whitelist = hostname;
      }
      myPanel.hide();
    });
    if (ss.storage.whitelist) {
      myPanel.port.emit("getWhitelist", ss.storage.whitelist);
    }
    else {
      myPanel.port.emit("getWhitelist", "");
    }
  }
}

function handleHide() {
  button.state('window', { checked: false });
}

var { setTimeout } = require("sdk/timers");
var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;

if (!ss.storage.updateTime) {
  ss.storage.updateTime = _updateTime;
}

var interval = ss.storage.updateTime - Date.now();

if (interval < 0) {
  interval = 10;
}

setTimeout(function () {
  var updateCookieBase = Request({
    url: "https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt",
    overrideMimeType: "text/plain; charset=utf-8",
    onComplete: function (response) {
      if (response.status == 200) {
        ss.storage.cookieBase = response.text;
      }
      _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;
      ss.storage.updateTime = _updateTime;
      interval = ss.storage.updateTime - Date.now();
    }
  });
  updateCookieBase.get();
}, interval)
