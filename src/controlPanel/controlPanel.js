function saveFilters(e) {
  e.preventDefault();
  chrome.storage.local.set({
    userFilters: document.querySelector("#userFilters").value
  });
  document.querySelector("#my-filters button").disabled = true;
}

function restoreFilters() {
  chrome.storage.local.get(['userFilters'], function (result) {
    if (result.userFilters) {
      document.querySelector("#userFilters").value = result.userFilters;
    }
  });
}


document.addEventListener("DOMContentLoaded", restoreFilters);
document.querySelector("#my-filters form").addEventListener("submit", saveFilters);

document.addEventListener('DOMContentLoaded', function () {
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

  autosize(document.querySelector("#cookieBaseContent"));

  chrome.storage.local.get(['lastOpenedTab'], function (result) {
    if (result.lastOpenedTab) {
      document.querySelector('.mui-tabs__bar [data-mui-controls='+result.lastOpenedTab+']').parentNode.classList.add("mui--is-active");
      document.querySelector('.mobileMenu [data-mui-controls='+result.lastOpenedTab+']').parentNode.classList.add("mui--is-active");
      document.querySelector('div#'+result.lastOpenedTab).classList.add("mui--is-active");
    }
    else {
      var firstDesktopTab = document.querySelectorAll('.mui-tabs__bar li')[0];
      var firstMobileTab = document.querySelectorAll('.mobileMenu li')[0];
      firstDesktopTab.classList.add("mui--is-active");
      firstMobileTab.classList.add("mui--is-active");
      document.querySelector('div#'+firstMobileTab.querySelector("a").getAttribute("data-mui-controls")).classList.add("mui--is-active");
    }
  });
});

document.querySelector("#about .extensionInfo").textContent = chrome.i18n.getMessage("extensionName") + " " + chrome.runtime.getManifest().version;


function saveWhitelist(e) {
  e.preventDefault();
  chrome.storage.local.set({
    whitelist: document.querySelector("#user-whitelist").value
  });
  document.querySelector("#whitelist button").disabled = true;
}

function restoreWhitelist() {
  chrome.storage.local.get(['whitelist'], function (result) {
    if (result.whitelist) {
      document.querySelector("#user-whitelist").value = result.whitelist;
    }
  });
}

document.addEventListener("DOMContentLoaded", restoreWhitelist);
document.querySelector("#whitelist form").addEventListener("submit", saveWhitelist);

document.querySelector("title").textContent = chrome.i18n.getMessage("extensionName") + " - " + chrome.i18n.getMessage("controlPanel");

document.querySelector("#my-filters textarea").addEventListener('input', function () {
  chrome.storage.local.get(["userFilters"], function (result) {
    var element = document.querySelector("#my-filters textarea");
    if (element.value == result.userFilters) {
      document.querySelector("#my-filters button").disabled = true;
    }
    else {
      document.querySelector("#my-filters button").disabled = false;
    }
  });
});

document.querySelector("textarea#user-whitelist").addEventListener('input', function () {
  chrome.storage.local.get(["whitelist"], function (result) {
    var element = document.querySelector("textarea#user-whitelist");
    if (element.value == result.whitelist) {
      document.querySelector("#whitelist button").disabled = true;
    }
    else {
      document.querySelector("#whitelist button").disabled = false;
    }
  });
});

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

document.addEventListener("DOMContentLoaded", updateVersion);

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

var tabs = document.querySelectorAll('[data-mui-toggle="tab"]');
for (var i = 0; i < tabs.length; i++) {
  tabs[i].addEventListener("click", function () {
    chrome.storage.local.set({
      lastOpenedTab: this.getAttribute("data-mui-controls")
    });
  })
}
