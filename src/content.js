/*******************************************************************************
    Copyright (C) 2021 Filters Heroes
    This file is part of Polish Cookie Consent.

    Polish Cookie Consent is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Polish Cookie Consent is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Polish Cookie Consent. If not, see {http://www.gnu.org/licenses/}.
*/

var url = location.href;

function getUrlCondition(urlArg) {
    var condition;
    if (urlArg.match("=")) {
        condition = url == urlArg.replace("=", "");
    } else if (urlArg.match(new RegExp("^\/.*\/$"))) {
        condition = url.match(new RegExp(urlArg.slice(0, -1).substring(1), "g"));
    }
    else {
        let urlArgs = urlArg.split(',');
        for (let i in urlArgs) {
            urlArgs[i] = urlArgs[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            urlArgs[i] = new RegExp("^https?:\\/\\/(.*\\.)?" + urlArgs[i] + "(\\/.*)?$", "g");
        }
        condition = isSingleURLMatch(urlArgs, url);
    }
    return condition;
}

function isSingleURLMatch(arr, val) {
    return arr.some(function (arrVal) {
        return val.match(arrVal);
    });
}

function clickInteractive(urlArg, element, cookieNameOrMaxCount, text) {
    if (getUrlCondition(urlArg)) {
        document.onreadystatechange = function () {
            if (document.readyState === "interactive") {
                var condition;
                var counter = 0;
                if (cookieNameOrMaxCount) {
                    if (isNaN(cookieNameOrMaxCount)) {
                        condition = !new RegExp("(^|;\\s?)" + cookieNameOrMaxCount + "=").test(document.cookie);
                    }
                    else {
                        condition = counter < cookieNameOrMaxCount;
                    }
                } else {
                    condition = counter < 1
                }
                (function checkIfElemExists() {
                    let btnYes;
                    if (text) {
                        btnYes = document.evaluate("//" + element + "[contains(text(), " + '"' + text + '"' + ")]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
                    } else {
                        btnYes = document.querySelector(element);
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

function clickComplete(urlArg, element, cookieNameOrMaxCount, text) {
    if (getUrlCondition(urlArg)) {
        document.onreadystatechange = function () {
            if (document.readyState === "complete") {
                var condition;
                var counter = 0;
                if (cookieNameOrMaxCount) {
                    if (isNaN(cookieNameOrMaxCount)) {
                        condition = !new RegExp("(^|;\\s?)" + cookieNameOrMaxCount + "=").test(document.cookie);
                    }
                    else {
                        condition = counter < cookieNameOrMaxCount;
                    }
                } else {
                    condition = counter < 1
                }
                (function checkIfElemExists() {
                    let btnYes;
                    if (text) {
                        btnYes = document.evaluate("//" + element + "[contains(text(), " + '"' + text + '"' + ")]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
                    } else {
                        btnYes = document.querySelector(element);
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

function clickTimeout(urlArg, element, cookieNameOrMaxCount, text) {
    if (getUrlCondition(urlArg)) {
        var condition;
        var counter = 0;
        if (cookieNameOrMaxCount) {
            if (isNaN(cookieNameOrMaxCount)) {
                condition = !new RegExp("(^|;\\s?)" + cookieNameOrMaxCount + "=").test(document.cookie);
            }
            else {
                condition = counter < cookieNameOrMaxCount;
            }
        } else {
            condition = counter < 1
        }
        (function checkIfElemExists() {
            let btnYes;
            if (text) {
                btnYes = document.evaluate("//" + element + "[contains(text(), " + '"' + text + '"' + ")]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
            } else {
                btnYes = document.querySelector(element);
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

function bakeCookie(urlArg, cookieName, cookieValue, expiresDays, domain) {
    if (getUrlCondition(urlArg)) {
        if (!new RegExp("(^|;\\s?)" + cookieName + "=").test(document.cookie)) {
            var d = new Date();
            d.setTime(d.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            if (domain) {
                document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";" + "domain=" + domain + ";path=/";
            }
            else {
                document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
            }
            location.reload();
        }
    }
}

function addToStorage(urlArg, storageKey, storageValue) {
    if (getUrlCondition(urlArg)) {
        if (localStorage.getItem(storageKey) === undefined || localStorage.getItem(storageKey) === null) {
            localStorage.setItem(storageKey, storageValue);
        }
    }
}


function redirect(urlArg, redirectPoint, path, cookieName) {
    if (getUrlCondition(urlArg)) {
        if (!new RegExp("(^|;\\s?)" + cookieName + "=").test(document.cookie)) {
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
        var urlArg = filter.split('##+js')[0];
        var funcArgs = filter.split("##+js(")[1];
        if (funcArgs) {
            var jsfunc = funcArgs.split(",")[0].trim();
            var arglen = funcArgs.split(", ").length - 1;

            var arg = funcArgs.slice(0, -1).split(", ")[1];

            if (arglen >= 2) {
                var arg2 = funcArgs.slice(0, -1).split(", ")[2];
            }

            if (arglen >= 3) {
                var arg3 = funcArgs.slice(0, -1).split(", ")[3];
            }

            if (arglen == 4) {
                var arg4 = funcArgs.slice(0, -1).split(", ")[4];
            }

            var element = arg;
            if (jsfunc == "clickInteractive" || jsfunc == "clickTimeout" || jsfunc == "clickComplete") {
                if (arglen >= 2) {
                    var cookieNameOrMaxCount = arg2;
                }
                if (arglen == 3) {
                    var text = arg3;
                }
                if (arglen == 1) {
                    if (jsfunc == "clickInteractive") {
                        clickInteractive(urlArg, element);
                    } else if (jsfunc == "clickTimeout") {
                        clickTimeout(urlArg, element);
                    } else if (jsfunc == "clickComplete") {
                        clickComplete(urlArg, element);
                    }
                }
                else if (arglen == 2) {
                    if (jsfunc == "clickInteractive") {
                        clickInteractive(urlArg, element, cookieNameOrMaxCount);
                    } else if (jsfunc == "clickTimeout") {
                        clickTimeout(urlArg, element, cookieNameOrMaxCount);
                    } else if (jsfunc == "clickComplete") {
                        clickComplete(urlArg, element, cookieNameOrMaxCount);
                    }
                }
                else if (arglen == 3) {
                    if (jsfunc == "clickInteractive") {
                        clickInteractive(urlArg, element, cookieNameOrMaxCount, text);
                    } else if (jsfunc == "clickTimeout") {
                        clickTimeout(urlArg, element, cookieNameOrMaxCount, text);
                    } else if (jsfunc == "clickComplete") {
                        clickComplete(urlArg, element, cookieNameOrMaxCount, text);
                    }
                }
            }
            else if (jsfunc == "addToStorage") {
                var storageKey = arg;
                var storageValue = arg2;
                addToStorage(urlArg, storageKey, storageValue);
            }
            else if (jsfunc == "bakeCookie") {
                var cookieName = arg;
                var cookieValue = arg2;
                var expiresDays = arg3;
                var domain = arg4;
                if (arglen == 4) {
                    bakeCookie(urlArg, cookieName, cookieValue, expiresDays, domain);
                } else {
                    bakeCookie(urlArg, cookieName, cookieValue, expiresDays);
                }
            }
            else if (jsfunc == "redirect") {
                var redirectPoint = arg;
                var path = arg2;
                if (arglen == 3) {
                    var cookieName = arg3;
                    redirect(urlArg, redirectPoint, path, cookieName);
                } else {
                    path = arg2.replace(")", "");
                    redirect(urlArg, redirectPoint, path);
                }
            }
        }
    }
}

function runFilterLists() {
    PCC_vAPI.storage.local.get('selectedFilterLists').then(function (resultSelectedFL) {
        if (typeof resultSelectedFL !== "undefined" && resultSelectedFL != "") {
            resultSelectedFL.forEach((selectedFL) => {
                PCC_vAPI.storage.local.get(selectedFL).then(function (resultFilterList) {
                    if (typeof resultFilterList !== "undefined" && resultFilterList != "") {
                        var filters;
                        if(selectedFL == "userFilters") {
                            filters = resultFilterList.split("\n");
                        } else {
                            filters = JSON.parse(resultFilterList)["content"].split("\n");
                        }
                        for (var i = 0; i < filters.length; i++) {
                            initArgs(filters[i]);
                        }
                    }
                });
            });
        }
    });
}

PCC_vAPI.storage.local.get('whitelist').then(function (resultWhitelist) {
    if (typeof resultWhitelist !== "undefined" && resultWhitelist != "") {
        function containsCommentSign(value) {
            return value.indexOf("!") && value.indexOf("#") && value != "";
        }
        var whitelist = resultWhitelist.split("\n").filter(containsCommentSign).join([separator = ',']);
        if (!getUrlCondition(whitelist)) {
            runFilterLists();
        }
    }
    else {
        runFilterLists();
    }
});
