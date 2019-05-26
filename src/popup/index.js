// ----------------- Internationalization ------------------
for (const node of document.querySelectorAll('[data-i18n]')) {
  let [text, attr] = node.dataset.i18n.split('|');
  text = chrome.i18n.getMessage(text);
  attr ? node[attr] = text : node.appendChild(document.createTextNode(text));
}
// ----------------- /Internationalization -----------------

var wrapper = document.querySelectorAll(".wrapper");

for (var i = 0; i < wrapper.length; i++) {
  wrapper[i].addEventListener('click', function(event) {
    chrome.tabs.create({url: this.dataset.href});
  });
}

var manifest = chrome.runtime.getManifest();
document.querySelector(".title > p").textContent += " "+manifest.version;
