function handleTextResponse(response) {
    return response.text()
        .then(text => {
            if (response.ok) {
                PCC_vAPI.storage.local.set("cookieBase", text);
            } else {
                return Promise.reject({
                    status: response.status,
                    statusText: response.statusText,
                    err: text
                })
            }
        })
}

function setUpdateTime() {
    var _updateTime = new Date().getTime() + 24 * 7 * 60 * 60 * 1000;
    PCC_vAPI.storage.local.set("updateTime", _updateTime).then(function () {
        updateCookieBase(_updateTime);
    });
}

function updateCookieBase(updateTime) {
    var interval = parseInt(updateTime) - Date.now();
    if (interval) {
        if (interval < 0) {
            interval = 10;
        }
        setTimeout(function () {
            fetch("https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/PCB.txt")
                .then(handleTextResponse)
                .catch(error => console.log(error));
            setUpdateTime();
        }, interval);
    }
}

PCC_vAPI.onFirstRunOrUpdate().then(function (result) {
    if (result == "install" || result == "update") {
        let cookieBaseURL;
        if (PCC_vAPI.isWebExtension() == true) {
            cookieBaseURL = "/PCB.txt";
        } else {
            cookieBaseURL = "chrome://PCC/content/PCB.txt";
        }
        fetch(cookieBaseURL)
            .then(handleTextResponse)
            .catch(error => console.log(error));
        setUpdateTime();
    } else if (PCC_vAPI.isWebExtension() == false) {
        if (result == "nothing") {
            PCC_vAPI.storage.local.get("updateTime").then(function (resultUpdateTime) {
                if (resultUpdateTime) {
                    updateCookieBase(resultUpdateTime);
                }
            });
        }
    }
});

if (PCC_vAPI.isWebExtension() == true) {
    PCC_vAPI.storage.local.get("updateTime").then(function (resultUpdateTime) {
        if (resultUpdateTime) {
            updateCookieBase(resultUpdateTime);
        }
    });
}
