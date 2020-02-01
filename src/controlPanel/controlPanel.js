function saveFilters(e) {
  e.preventDefault();
  self.port.emit("saveFilters", document.querySelector("#userFilters").value);
  document.querySelector("#my-filters button").disabled = true;
}


function restoreFilters() {
  self.port.on("restoreFilters", function(userFilters) {
    if(userFilters) {
      document.querySelector("#userFilters").value = userFilters;
    }
  });
}


document.addEventListener("DOMContentLoaded", restoreFilters);
document.querySelector("#my-filters form").addEventListener("submit", saveFilters);

self.port.on("restoreFilters", function(userFilters) {
  document.querySelector("#my-filters textarea").addEventListener('input', function () {
    var element = document.querySelector("#my-filters textarea");
    if (element.value == userFilters) {
      document.querySelector("#my-filters button").disabled = true;
    }
    else {
      document.querySelector("#my-filters button").disabled = false;
    }
  });
});


document.addEventListener('DOMContentLoaded', function () {
  document.querySelector("div#cookie-base").hidden = "";
  var bodyEl = document.querySelector('body'),
  sidedrawerEl = document.querySelector('#sidedrawer');

  function showSidedrawer() {
    // show overlay
    var overlayEl = mui.overlay('on');

    // show element
    overlayEl.appendChild(sidedrawerEl);
    setTimeout(function () {
      sidedrawerEl.classList.add('active');
      var desktopTabs = document.querySelectorAll('.mui-tabs__bar li a');
      for (var i = 0; i < desktopTabs.length; i++) {
        desktopTabs[i].setAttribute("data-mui-controls", "");
      }
    }, 20);
  }

  function hideSidedrawer() {
    bodyEl.classList.remove('hide-sidedrawer');
    bodyEl.classList.remove('mui-scroll-lock');
    sidedrawerEl.classList.remove('active');
    mui.overlay('off');
  }


  document.querySelector('.js-show-sidedrawer').addEventListener("click", showSidedrawer);
  document.querySelector('.js-hide-sidedrawer').addEventListener("click", hideSidedrawer);
});

const { Services } = Components.utils.import("resource://gre/modules/Services.jsm");
const { AddonManager } = Components.utils.import("resource://gre/modules/AddonManager.jsm");

const stringBundle = Services.strings.createBundle(document.querySelector("meta[stringbundle]").getAttribute("stringbundle"));
AddonManager.getAddonByID("PolishCookieConsentExt@polishannoyancefilters.netlify.com", function(addon) {
  document.querySelector("#about .extensionInfo").textContent = stringBundle.GetStringFromName("extensionName") + " " + addon.version;
});


function saveWhitelist(e) {
  e.preventDefault();
  self.port.emit("saveWhitelist", document.querySelector("#user-whitelist").value);
  document.querySelector("#whitelist button").disabled = true;
}

function restoreWhitelist() {
  self.port.on("restoreWhitelist", function(whitelist) {
    if(whitelist) {
      document.querySelector("#user-whitelist").value = whitelist;
    }
  });
}

document.addEventListener("DOMContentLoaded", restoreWhitelist);
document.querySelector("#whitelist form").addEventListener("submit", saveWhitelist);

self.port.on("restoreWhitelist", function(whitelist) {
  document.querySelector("textarea#user-whitelist").addEventListener('input', function () {
    var element = document.querySelector("textarea#user-whitelist");
    if (element.value === whitelist) {
      document.querySelector("#whitelist button").disabled = true;
    }
    else {
      document.querySelector("#whitelist button").disabled = false;
    }
  });
});



document.querySelector("title").textContent = stringBundle.GetStringFromName("extensionName") + " - " + stringBundle.GetStringFromName("controlPanel");

function updateVersion() {
  self.port.on("getCookieBase", function(cookieBase) {
    var cookieBaseLine = cookieBase.split("\n");
    for (var i = 0; i < cookieBaseLine.length; i++) {
      if (cookieBaseLine[i].match("Version")) {
        document.querySelector(".cBV").textContent += " " + cookieBaseLine[i].split(":")[1].trim();
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", updateVersion);

self.port.on("getCookieBase", function(cookieBase) {
  document.querySelector("#showCookieBase").addEventListener("click", function () {
    var cookieBaseContent = document.querySelector("#cookieBaseContent");
      if (cookieBase) {
        cookieBaseContent.textContent = cookieBase;
        document.querySelector(".cookieBaseContent").style = "";
        autosize(document.querySelector('#cookieBaseContent'));
      }
  })
});


document.querySelector("#updateCookieBase").addEventListener("click", function () {
  function handleTextResponse(response) {
    return response.text()
    .then(text => {
      if (response.ok) {
        self.port.emit("updateCookieBase", text);
        location.reload();
      } else {
        return Promise.reject({
          status: response.status,
          statusText: response.statusText,
          err: text
        })
      }
    })
  }

  fetch('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt')
  .then(handleTextResponse)
  .catch(error => console.log(error));
})

document.querySelector('.mui-tabs__bar [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
  autosize(document.querySelector('#user-whitelist'));
})

document.querySelector('.mui-tabs__bar [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
  autosize(document.querySelector('#userFilters'));
})

document.querySelector('#sidedrawer [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
  autosize(document.querySelector('#user-whitelist'));
})

document.querySelector('#sidedrawer [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
  autosize(document.querySelector('#userFilters'));
})
