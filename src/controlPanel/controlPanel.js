function saveFilters(e) {
  e.preventDefault();
  chrome.storage.local.set({
    userFilters: document.querySelector("#userFilters").value
  });
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
  document.querySelector("div#my-filters").hidden = "";
});


var btns = document.querySelectorAll(".nav-wrapper #tabs li");

// Add the active class to the current/clicked tab and show appropriate content
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.querySelector(".nav-wrapper #tabs li.active");
    current.className = current.className.replace("active", "");
    this.className += "active";
    document.querySelector(this.querySelector("a").getAttribute("href")).hidden = "";
    var notActive = document.querySelectorAll(".nav-wrapper #tabs li:not(.active) a");
    for (var j = 0; j < notActive.length; j++) {
      document.querySelector(notActive[j].getAttribute("href")).hidden = "true";
    }
  });
}

btns = document.querySelectorAll("#mobile-menu li");

// Add the active class to the current/clicked mobile tab and show appropriate content
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    var current = document.querySelector("#mobile-menu li.active");
    current.className = current.className.replace("active", "");
    this.className += "active";
    document.querySelector(this.querySelector("a").getAttribute("href")).hidden = "";
    var notActive = document.querySelectorAll("#mobile-menu li:not(.active) a");
    for (var j = 0; j < notActive.length; j++) {
      document.querySelector(notActive[j].getAttribute("href")).hidden = "true";
    }
  });
}

document.querySelector("#about .extensionInfo").textContent += " "+chrome.runtime.getManifest().version;


function saveWhitelist(e) {
  e.preventDefault();
  chrome.storage.local.set({
    whitelist: document.querySelector("#user-whitelist").value
  });
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
