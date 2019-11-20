var wrapper = document.querySelectorAll(".wrapper");

for (var i = 0; i < wrapper.length; i++) {
  wrapper[i].addEventListener('click', function(event) {
    chrome.tabs.create({url: this.dataset.href});
  });
}

var manifest = chrome.runtime.getManifest();
document.querySelector(".title > p").textContent += " "+manifest.version;
