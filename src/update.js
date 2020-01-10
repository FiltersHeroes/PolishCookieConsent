function handleTextResponse(response) {
  return response.text()
  .then(text => {
    if (response.ok) {
      chrome.storage.local.set({
        cookieBase: text
      });
    } else {
      return Promise.reject({
        status: response.status,
        statusText: response.statusText,
        err: text
      })
    }
  })
}

chrome.runtime.onInstalled.addListener(function () {

  fetch('/PCB.txt')
  .then(handleTextResponse)
  .catch(error => console.log(error));

  var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;
  chrome.storage.local.set({
    updateTime: _updateTime
  });
  chrome.storage.local.get(['updateTime'], function (result) {
    chrome.alarms.create('updateCookieBase', { when: parseInt(result.updateTime) });
  });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name == 'updateCookieBase') {

    fetch('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt')
    .then(handleTextResponse)
    .catch(error => console.log(error));

    var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;

    chrome.storage.local.set({
      updateTime: _updateTime
    });

    chrome.storage.local.get(['updateTime'], function (result) {
      chrome.alarms.create('updateCookieBase', { when: parseInt(result.updateTime) });
    });
  }
});
