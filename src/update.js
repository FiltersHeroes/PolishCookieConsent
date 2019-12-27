chrome.runtime.onInstalled.addListener(function(){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/PCB.txt', true);
  xhr.responseType = 'text';
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200) {
        chrome.storage.local.set({
          cookieBase: xhr.responseText
        });
      }
    }
  };
  xhr.send(null);

  var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;
  chrome.storage.local.set({
    updateTime: _updateTime
  });
  chrome.storage.local.get(['updateTime'], function(result) {
    chrome.alarms.create('updateCookieBase', { when: parseInt(result.updateTime) });
  });
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == 'updateCookieBase') {
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
      }
    };
    xhr.send(null);

    var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;

    chrome.storage.local.set({
      updateTime: _updateTime
    });

    chrome.storage.local.get(['updateTime'], function(result) {
      chrome.alarms.create('updateCookieBase', { when: parseInt(result.updateTime) });
    });
  }
});
