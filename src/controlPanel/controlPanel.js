function saveFilters(e) {
  e.preventDefault();
  chrome.storage.local.set({
    userFilters: document.querySelector("#userFilters").value
  });
  document.querySelector("#my-filters button").disabled = true;
}

function restoreFilters() {
  chrome.storage.local.get(['userFilters'], function(result) {
    if(result.userFilters)
    {
      document.querySelector("#userFilters").value = result.userFilters;
    }
    M.textareaAutoResize(document.querySelector("#userFilters"));
  });
}


document.addEventListener("DOMContentLoaded", restoreFilters);
document.querySelector("#my-filters form").addEventListener("submit", saveFilters);

document.addEventListener('DOMContentLoaded', function() {
  M.Sidenav.init(document.querySelectorAll('.sidenav'));
  M.Tabs.init(document.querySelector('#mobile-menu'))
  M.Tabs.init(document.querySelector('#tabs'))
  document.querySelector("div#cookie-base").hidden = "";
});


var btns = document.querySelectorAll(".nav-wrapper #tabs li");

// Add the active class to the current/clicked tab
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.querySelector(".nav-wrapper #tabs li.active");
    current.classList.remove("active");
    this.classList.add("active");
  });
}

btns = document.querySelectorAll("#mobile-menu li");

// Add the active class to the current/clicked mobile tab
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.querySelector("#mobile-menu li.active");
    current.classList.remove("active");
    this.classList.add("active");
  });
}

document.querySelector("#about .extensionInfo").textContent = chrome.i18n.getMessage("extensionName")+" "+chrome.runtime.getManifest().version;


function saveWhitelist(e) {
  e.preventDefault();
  chrome.storage.local.set({
    whitelist: document.querySelector("#user-whitelist").value
  });
  document.querySelector("#whitelist button").disabled = true;
}

function restoreWhitelist() {
  chrome.storage.local.get(['whitelist'], function(result) {
    if(result.whitelist)
    {
      document.querySelector("#user-whitelist").value = result.whitelist;
    }
    M.textareaAutoResize(document.querySelector("#user-whitelist"));
  });
}

document.addEventListener("DOMContentLoaded", restoreWhitelist);
document.querySelector("#whitelist form").addEventListener("submit", saveWhitelist);

document.querySelector("title").textContent = chrome.i18n.getMessage("extensionName") + " - " + chrome.i18n.getMessage("controlPanel");

document.querySelector("#my-filters textarea").addEventListener('input', function()
{
  chrome.storage.local.get(["userFilters"], function(result) {
    var element = document.querySelector("#my-filters textarea");
    if(element.value == result.userFilters)
    {
      document.querySelector("#my-filters button").disabled = true;
    }
    else
    {
      document.querySelector("#my-filters button").disabled = false;
    }
  });
});

document.querySelector("textarea#user-whitelist").addEventListener('input', function()
{
  chrome.storage.local.get(["whitelist"], function(result) {
    var element = document.querySelector("textarea#user-whitelist");
    if(element.value == result.whitelist)
    {
      document.querySelector("#whitelist button").disabled = true;
    }
    else
    {
      document.querySelector("#whitelist button").disabled = false;
    }
  });
});

function updateVersion() {
  chrome.storage.local.get(['cookieBase'], function(result) {
    if(result.cookieBase)
    {
      var cookieBaseLine = result.cookieBase.split("\n");
      for (var i=0; i<cookieBaseLine.length; i++) {
        if (cookieBaseLine[i].match("Version"))
        {
          document.querySelector(".cBV").textContent += " " + cookieBaseLine[i].split(":")[1].trim();
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", updateVersion);

document.querySelector("#showCookieBase").addEventListener("click", function() {
  var cookieBaseContent = document.querySelector("#cookieBaseContent");
  chrome.storage.local.get(['cookieBase'], function(result) {
    if(result.cookieBase)
    {
      cookieBaseContent.textContent = result.cookieBase;
      cookieBaseContent.hidden = "";
      M.textareaAutoResize(cookieBaseContent);
    }
  });
})

document.querySelector("#updateCookieBase").addEventListener("click", function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt', true);

  xhr.responseType = 'text';

  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        chrome.storage.local.set({
          cookieBase: xhr.responseText
        });
      }
      location.reload();
    }
  };
  xhr.send(null);
})
