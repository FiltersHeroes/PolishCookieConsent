var url = location.href;

function getUrlCondition(urlArg) {
    var condition;
    if (urlArg.match("=")) {
        condition = url == urlArg.replace("=", "");
    }
    else {
        condition = url.match(RegExp(urlArg));
    }
    return condition;
}

function clickInteractive(element, urlArg, cookieName) {
    if (getUrlCondition(urlArg)) {
        document.onreadystatechange = function () {
            if (document.readyState === "interactive") {
                var counter = 0;
                (function checkIfElemExists() {
                    var btnYes = document.querySelector(element);
                    var condition;
                    if (cookieName) {
                        condition = document.cookie.indexOf(cookieName + "=") == -1;
                    }
                    else {
                        condition = counter < 10
                    }
                    if (btnYes == null && condition) {
                        window.requestAnimationFrame(checkIfElemExists);
                        counter++;
                    } else if (btnYes) {
                        btnYes.click()
                    }
                })()
            }
        }
    }
}

function clickComplete(element, urlArg, cookieName) {
    if (getUrlCondition(urlArg)) {
        document.onreadystatechange = function () {
            if (document.readyState === "complete") {
                var btnYes = document.querySelector(element);
                if (document.cookie.indexOf(cookieName + "=") == -1) {
                    btnYes.click();
                }
            }
        }
    }
}

function clickCompleteText(element, text, urlArg) {
    if (getUrlCondition(urlArg)) {
        window.addEventListener('load', function () {
            var counter = 0;
            (function checkIfElemExists() {
                var btnYes = document.evaluate("//" + element + "[contains(text(), " + '"' + text + '"' + ")]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
                if (counter < 200 && btnYes == null) {
                    window.requestAnimationFrame(checkIfElemExists);
                    counter++;
                } else if (btnYes) {
                    btnYes.click()
                }
            })()
        });
    }
}

function clickTimeout(element, urlArg, cookieName) {
    if (getUrlCondition(urlArg)) {
        var condition;
        var counter = 0;
        if (cookieName) {
            condition = document.cookie.indexOf(cookieName + "=") == -1;
        }
        else {
            condition = counter < 200
        }
        (function checkIfElemExists() {
            var btnYes = document.querySelector(element);
            if (btnYes == null && condition) {
                window.requestAnimationFrame(checkIfElemExists);
                counter++;
            } else if (btnYes) {
                btnYes.click()
            }
        })()
    }
}

function bakeCookie(cookieName, cookieValue, expiresDays, urlArg) {
    if (getUrlCondition(urlArg)) {
        if (document.cookie.indexOf(cookieName + "=") == -1) {
            var d = new Date();
            d.setTime(d.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
            location.reload();
        }
    }
}

function addToStorage(storageKey, storageValue, urlArg) {
    if (getUrlCondition(urlArg)) {
        if (localStorage.getItem(storageKey) === undefined || localStorage.getItem(storageKey) === null) {
            localStorage.setItem(storageKey, storageValue);
        }
    }
}


function redirect(redirectPoint, path, urlArg, cookieName) {
    if (getUrlCondition(urlArg)) {
        if (document.cookie.indexOf(cookieName) == -1) {
            if (path == "true") {
                window.location = "/" + redirectPoint + location.pathname;
            }
            else {
                window.location = "/" + redirectPoint;
            }
        }
    }
}

function initArgs(filter) {
    if (filter != "" && !filter.match(/^!|^#/)) {
        var urlArg = filter.split('(')[0];
        var jsfunc = filter.split("(")[1].split(",")[0].trim();

        if (jsfunc == "clickInteractive" || jsfunc == "clickComplete" || jsfunc == "clickCompleteText" || jsfunc == "addToStorage" || jsfunc == "clickTimeout") {
            var arglen = filter.split("(")[1].split(", ").length;
            if (arglen == 2) {
                var element = filter.split("(")[1].split(", ")[1].replace(")", "");
            }
            else {
                var element = filter.split("(")[1].split(", ")[1];
                var arg2 = filter.split("(")[1].split(", ")[2].replace(")", "");
            }

            if (jsfunc == "clickInteractive") {
                if (arglen == 3) {
                    var cookieName = arg2;
                    clickInteractive(element, urlArg, cookieName);
                }
                else {
                    clickInteractive(element, urlArg);
                }
            }
            else if (jsfunc == "clickComplete") {
                var cookieName = arg2;
                clickComplete(element, urlArg, cookieName);
            }
            else if (jsfunc == "clickCompleteText") {
                var text = arg2;
                clickCompleteText(element, text, urlArg);
            }
            else if (jsfunc == "addToStorage") {
                var storageKey = element;
                var storageValue = arg2;
                addToStorage(storageKey, storageValue, urlArg);
            }
            else if (jsfunc == "clickTimeout") {
                if (arglen == 3) {
                    var cookieName = arg2;
                    clickTimeout(element, urlArg, cookieName);
                }
                else {
                    clickTimeout(element, urlArg);
                }
            }
        }
        else if (jsfunc == "bakeCookie" || jsfunc == "redirect") {
            var arg = filter.split("(")[1].split(", ")[1];
            var arg2 = filter.split("(")[1].split(", ")[2];
            var arglen = filter.split("(")[1].split(", ").length;

            if (arglen == 4) {
                var arg3 = filter.split("(")[1].split(", ")[3].replace(")", "");
            }

            if (jsfunc == "bakeCookie") {
                var cookieName = arg;
                var cookieValue = arg2;
                var expiresDays = arg3;
                bakeCookie(cookieName, cookieValue, expiresDays, urlArg);
            }
            else if (jsfunc == "redirect") {
                var redirectPoint = arg;
                var path = arg2;
                if (arglen == 4) {
                    var cookieName = arg3;
                    redirect(redirectPoint, path, urlArg, cookieName);
                }
                else {
                    path = arg2.replace(")", "");
                    redirect(redirectPoint, path, urlArg);
                }
            }

        }
    }
}

function userFilters() {
    chrome.storage.local.get('userFilters', function (result) {
        if (typeof result.userFilters !== "undefined" && result.userFilters != "") {
            var filters = result.userFilters.split("\n");
            for (var i = 0; i < filters.length; i++) {
                initArgs(filters[i]);
            }
        }
    });
}

function cookieBaseFilters() {
    chrome.storage.local.get('cookieBase', function (result) {
        if (typeof result.cookieBase !== "undefined" && result.cookieBase != "") {
            var filters = result.cookieBase.split("\n");
            for (var i = 0; i < filters.length; i++) {
                initArgs(filters[i]);
            }
        }
    });
}

chrome.storage.local.get('whitelist', function (result) {
    if (typeof result.whitelist !== "undefined" && result.whitelist != "") {
        function containsCommentSign(value) {
            return value.indexOf("!") &&  value.indexOf("#");
        }
        var whitelist = result.whitelist.split("\n").filter(containsCommentSign).join([separator = '|']);
        if (!getUrlCondition(whitelist)) {
            userFilters();
            cookieBaseFilters();
        }
    }
    else {
        userFilters();
        cookieBaseFilters();
    }
});
