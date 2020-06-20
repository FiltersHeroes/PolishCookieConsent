// Title
document.querySelector("title").textContent = chrome.i18n.getMessage("extensionName") + " - " + chrome.i18n.getMessage("controlPanel");

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
    chrome.storage.local.set({
      lastOpenedTab: this.getAttribute("data-mui-controls")
    });
  })
}

// Get last opened tab ID and open it
chrome.storage.local.get(['lastOpenedTab'], function (result) {
  if (result.lastOpenedTab) {
    document.querySelector('.mui-tabs__bar [data-mui-controls=' + result.lastOpenedTab + ']').parentNode.classList.add("mui--is-active");
    document.querySelector('.mobileMenu [data-mui-controls=' + result.lastOpenedTab + ']').parentNode.classList.add("mui--is-active");
    document.querySelector('div#' + result.lastOpenedTab).classList.add("mui--is-active");
  }
  else {
    var firstDesktopTab = document.querySelectorAll('.mui-tabs__bar li')[0];
    var firstMobileTab = document.querySelectorAll('.mobileMenu li')[0];
    firstDesktopTab.classList.add("mui--is-active");
    firstMobileTab.classList.add("mui--is-active");
    document.querySelector('div#' + firstMobileTab.querySelector("a").getAttribute("data-mui-controls")).classList.add("mui--is-active");
  }
});

// Automatically adjust textareas height
autosize(document.querySelector("#cookieBaseContent"));
autosize(document.querySelector("#userFilters"));
autosize(document.querySelector("#userWhitelist"));

document.querySelector('.mui-tabs__bar [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
  autosize.update(document.querySelector('#userWhitelist'));
})

document.querySelector('.mui-tabs__bar [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
  autosize.update(document.querySelector('#userFilters'));
})

document.querySelector('#sidedrawer [data-mui-controls="whitelist"]').addEventListener("mui.tabs.showend", function () {
  autosize.update(document.querySelector('#userWhitelist'));
})

document.querySelector('#sidedrawer [data-mui-controls="my-filters"]').addEventListener("mui.tabs.showend", function () {
  autosize.update(document.querySelector('#userFilters'));
})

// Show version number of Polish Cookie Base
document.addEventListener("DOMContentLoaded", updateVersion);

function updateVersion() {
  chrome.storage.local.get(['cookieBase'], function (result) {
    if (result.cookieBase) {
      var cookieBaseLine = result.cookieBase.split("\n");
      for (var i = 0; i < cookieBaseLine.length; i++) {
        if (cookieBaseLine[i].match("Version")) {
          var cBV = document.querySelector(".cBV");
          cBV.textContent = cBV.textContent.split(':')[0] + ": " + cookieBaseLine[i].split(":")[1].trim();
        }
      }
    }
  });
}

// Manual update of Cookie Base
document.querySelector("#updateCookieBase").addEventListener("click", function () {
  var updateBtn = document.querySelector("button#updateCookieBase");
  function handleTextResponse(response) {
    return response.text()
      .then(text => {
        if (response.ok) {
          chrome.storage.local.set({
            cookieBase: text
          });
          document.querySelector("#cookieBaseContent").textContent = text;
          updateVersion();
          updateBtn.classList.remove("active");
        } else {
          return Promise.reject({
            status: response.status,
            statusText: response.statusText,
            err: text
          })
        }
      })
  }
  updateBtn.classList.add("active");
  fetch('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt')
    .then(handleTextResponse)
    .catch(error => console.log(error));
})

// Show/hide Cookie Base
document.querySelector("#showCookieBase").addEventListener("click", function () {
  var cookieBaseContent = document.querySelector("#cookieBaseContent");
  var toggleBtn = document.querySelector("button#showCookieBase");
  chrome.storage.local.get(['cookieBase'], function (result) {
    if (result.cookieBase && cookieBaseContent.textContent.length == 0) {
      cookieBaseContent.textContent = result.cookieBase;
      document.querySelector(".cookieBaseContent").style = "";
      cookieBaseContent.style.visibility = "";
      toggleBtn.querySelector("svg.hideCookieBase").removeAttribute("hidden");
      toggleBtn.querySelector("svg.showCookieBase").setAttribute("hidden", true);
      replaceI18n(toggleBtn, "__MSG_hideCookieBase__");
    }
    else if (cookieBaseContent.textContent.length > 0) {
      cookieBaseContent.textContent = "";
      cookieBaseContent.style.visibility = "hidden";
      toggleBtn.querySelector("svg.hideCookieBase").setAttribute("hidden", true);
      toggleBtn.querySelector("svg.showCookieBase").removeAttribute("hidden");
      replaceI18n(toggleBtn, "__MSG_showCookieBase__");
    }
    autosize.update(cookieBaseContent);
  });
})

// Add user filters to textarea
chrome.storage.local.get(['userFilters'], function (result) {
  if (result.userFilters) {
    document.querySelector("#userFilters").value = result.userFilters;
  }
  autosize.update(document.querySelector("#userFilters"));
});

// Save user filters
document.querySelector("#my-filters form").addEventListener("submit", function (e) {
  e.preventDefault();
  chrome.storage.local.set({
    userFilters: document.querySelector("#userFilters").value
  });
  document.querySelector("#userFiltersApply").disabled = true;
});

// Disable/enable submit user filters button
document.querySelector("#userFilters").addEventListener('input', function () {
  chrome.storage.local.get(["userFilters"], function (result) {
    var element = document.querySelector("#userFilters");
    if (element.value == result.userFilters) {
      document.querySelector("#userFiltersApply").disabled = true;
    }
    else {
      document.querySelector("#userFiltersApply").disabled = false;
    }
  });
});


// Add whitelist to textarea
chrome.storage.local.get(['whitelist'], function (result) {
  if (result.whitelist) {
    document.querySelector("#userWhitelist").value = result.whitelist;
  }
  autosize.update(document.querySelector('#userWhitelist'));
});

// Save whitelist
document.querySelector("#whitelist form").addEventListener("submit", function (e) {
  e.preventDefault();
  chrome.storage.local.set({
    whitelist: document.querySelector("#userWhitelist").value
  });
  document.querySelector("#whitelistApply").disabled = true;
});

// Disable/enable submit whitelist button
document.querySelector("textarea#userWhitelist").addEventListener('input', function () {
  chrome.storage.local.get(["whitelist"], function (result) {
    var element = document.querySelector("textarea#userWhitelist");
    if (element.value == result.whitelist) {
      document.querySelector("#whitelistApply").disabled = true;
    }
    else {
      document.querySelector("#whitelistApply").disabled = false;
    }
  });
});

// Import user filters and whitelist
document.querySelector('#userFiltersImport').addEventListener('click', function () {
  importText("userFilters", "userFiltersApply");
});

document.querySelector('#whitelistImport').addEventListener('click', function () {
  importText("userWhitelist", "whitelistApply");
});

function importText(textarea, button) {
  var fp = document.getElementById("importFilePicker");
  fp.addEventListener('change', function () {
    const file = fp.files[0];
    const fr = new FileReader();
    fr.onload = function (e) {
      document.getElementById(textarea).value = fr.result;
      autosize.update(document.getElementById(textarea));
      document.getElementById(button).disabled = false;
    }
    fr.readAsText(file);
  })
  fp.value = '';
  fp.click();
}

// Export user filters and whitelist
document.querySelector('#userFiltersExport').addEventListener('click', function () {
  exportText("userFilters", "myFilters");
});

document.querySelector('#whitelistExport').addEventListener('click', function () {
  exportText("userWhitelist", "whitelist");
});

function todayDate() {
  return new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().replace(/\.\d+Z$/, '').replace(/:/g, '.').replace('T', '_');
}

function exportText(field, fileNamePart) {
  chrome.downloads.download({
    url: window.URL.createObjectURL(new Blob([document.getElementById(field).value], { type: "text/plain" })),
    filename: chrome.i18n.getMessage("extensionShortName") + "-" + chrome.i18n.getMessage(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt",
    saveAs: true
  });
}

// Add extension version to about tab
document.querySelector("#about .extensionInfo").textContent = chrome.i18n.getMessage("extensionName") + " " + chrome.runtime.getManifest().version;
