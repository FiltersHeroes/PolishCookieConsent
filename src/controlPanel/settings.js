// Enable/disable filterlists
document.querySelectorAll('.database input[type="checkbox"').forEach((filterlist) => {
    filterlist.addEventListener('change', () => {
        PCC_vAPI.storage.local.set(filterlist.id.replace("_toggle", "Enabled"), filterlist.checked);
    });
    document.addEventListener("DOMContentLoaded", () => {
        PCC_vAPI.storage.local.get(filterlist.id.replace("_toggle", "Enabled")).then(function (result) {
            filterlist.checked = result;
        });
    });
});


// Show version number of Polish Cookie Database
document.addEventListener("DOMContentLoaded", updateVersion);

function updateVersion() {
    PCC_vAPI.storage.local.get('cookieBase').then(function (resultCookieBase) {
        if (resultCookieBase) {
            var cookieBaseLine = resultCookieBase.split("\n");
            for (var i = 0; i < cookieBaseLine.length; i++) {
                if (cookieBaseLine[i].match("Version")) {
                    var cBV = document.querySelector("#cookieBase #version");
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
                    PCC_vAPI.storage.local.set("cookieBase", text);
                    cookieBaseContent.textContent = text;
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
    fetch('https://raw.githubusercontent.com/PolishFiltersTeam/PolishCookieConsent/master/src/cookieBase/PCB.txt')
        .then(handleTextResponse)
        .catch(error => console.log(error));
});
