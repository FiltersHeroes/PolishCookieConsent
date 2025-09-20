(async function () {
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

    function clickInteractive(element, cookieNameOrMaxCount, text) {
        document.addEventListener("readystatechange", () => {
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
        });
    }

    function clickComplete(element, cookieNameOrMaxCount, text) {
        document.addEventListener("readystatechange", () => {
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
        });
    }

    function clickTimeout(element, cookieNameOrMaxCount, text) {
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

    function bakeCookie(cookieName, cookieValue, expiresDays, domain) {
        if (!new RegExp("(^|;\\s?)" + cookieName + "=").test(document.cookie)) {
            var d = new Date();
            d.setTime(d.getTime() + (expiresDays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            if (cookieValue.includes("$now$")) {
                cookieValue = cookieValue.replace("$now$", Date.now());
            }
            if (cookieValue.includes("$currentDate$")) {
                cookieValue = cookieValue.replace("$currentDate$", new Date().toGMTString());
            }
            if (cookieValue.includes("$currentISODate$")) {
                cookieValue = cookieValue.replace("$currentISODate$", new Date().toISOString());
            }
            if (domain) {
                document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";" + "domain=" + domain + ";path=/";
            }
            else {
                document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
            }
            location.reload();
        }
    }

    function addToStorage(storageKey, storageValue) {
        if (localStorage.getItem(storageKey) === null) {
            localStorage.setItem(storageKey, storageValue);
        }
    }

    function addToSessionStorage(storageKey, storageValue) {
        if (sessionStorage.getItem(storageKey) === null) {
            sessionStorage.setItem(storageKey, storageValue);
        }
    }


    function redirect(redirectPoint, path, cookieName) {
        if (!new RegExp("(^|;\\s?)" + cookieName + "=").test(document.cookie)) {
            if (path == "true") {
                window.location = "/" + redirectPoint + location.pathname;
            }
            else {
                window.location = "/" + redirectPoint;
            }
        }
    }

    function initArgs(filter) {
        if (filter) {
            let funcArgs = filter.split("##+js(")[1]?.slice(0, -1)?.split(", ");
            if (funcArgs && funcArgs.length > 1) {
                let jsfunc = funcArgs[0];

                let arglen = funcArgs.length - 1;

                let arg = funcArgs[1];
                let arg2 = "";
                let arg3 = "";
                let arg4 = "";

                if (arglen >= 2) {
                    arg2 = funcArgs[2];
                }

                if (arglen >= 3) {
                    arg3 = funcArgs[3];
                }

                if (arglen == 4) {
                    arg4 = funcArgs[4];
                }

                var element = arg;
                if (jsfunc == "clickInteractive" || jsfunc == "clickTimeout" || jsfunc == "clickComplete") {
                    var cookieNameOrMaxCount = arg2;
                    var text = arg3;
                    if (jsfunc == "clickInteractive") {
                        clickInteractive(element, cookieNameOrMaxCount, text);
                    } else if (jsfunc == "clickTimeout") {
                        clickTimeout(element, cookieNameOrMaxCount, text);
                    } else if (jsfunc == "clickComplete") {
                        clickComplete(element, cookieNameOrMaxCount, text);
                    }
                }
                else if (jsfunc == "addToStorage" || jsfunc == "addToSessionStorage") {
                    if (arglen == 2) {
                        var storageKey = arg;
                        var storageValue = arg2;
                        if (storageValue.includes("$now$")) {
                            storageValue = storageValue.replace("$now$", Date.now());
                        }
                        if (storageValue.includes("$currentDate$")) {
                            storageValue = storageValue.replace("$currentDate$", new Date().toGMTString());
                        }
                        if (storageValue.includes("$currentISODate$")) {
                            storageValue = storageValue.replace("$currentISODate$", new Date().toISOString());
                        }
                        if (jsfunc == "addToStorage") {
                            addToStorage(storageKey, storageValue);
                        }
                        else {
                            addToSessionStorage(storageKey, storageValue);
                        }
                    }
                }
                else if (jsfunc == "bakeCookie") {
                    var cookieName = arg;
                    var cookieValue = arg2;
                    var expiresDays = arg3;
                    var domain = arg4;
                    if (!isNaN(expiresDays) && expiresDays > 0) {
                        bakeCookie(cookieName, cookieValue, expiresDays, domain);
                    }
                }
                else if (jsfunc == "redirect") {
                    var redirectPoint = arg;
                    var path = arg2;
                    var cookieName = arg3;
                    redirect(redirectPoint, path, cookieName);
                }
            }
        }
    }

    async function runFilterLists() {
        var resultExcludedlist = await PCC_vAPI.storage.local.get('whitelist');
        function containsCommentSign(value) {
            return value !== "" && (value.startsWith("!") || value.startsWith("#"));
        }
        if (resultExcludedlist) {
            var excludedlist = resultExcludedlist.split("\n").filter(containsCommentSign).join(',');
            if (getUrlCondition(excludedlist)) {
                return;
            }
        }

        var allFilters = [];
        var resultSelectedFL = await PCC_vAPI.storage.local.get('selectedFilterLists');
        if (resultSelectedFL) {
            for (let selectedFL of resultSelectedFL) {
                var resultFilterList = await PCC_vAPI.storage.local.get(selectedFL);
                if (resultFilterList) {
                    var filters;
                    if (selectedFL == "userFilters") {
                        filters = resultFilterList.split("\n");
                    } else {
                        filters = JSON.parse(resultFilterList)["content"].split("\n");
                    }
                    allFilters.push(...filters);
                }
            }
        }
        if (allFilters.length > 0) {
            allFilters = [...new Set(allFilters)];

            let excludeFilters = new Set();

            for (let i = allFilters.length - 1; i >= 0; i--) {
                if (containsCommentSign(allFilters[i])) {
                    allFilters.splice(i, 1);
                    continue;
                }
                if (allFilters[i].includes("#@#+js")) {
                    excludeFilters.add(allFilters[i].replace("#@#+js", "##+js"));
                    continue;
                }
                let urlArg = allFilters[i].split('##+js')[0];
                if (!urlArg || !getUrlCondition(urlArg)) {
                    allFilters.splice(i, 1);
                }
            }
            
            for (let i = 0; i < allFilters.length; i++) {
                if (excludeFilters.has(allFilters[i])) {
                    continue;
                }
                initArgs(allFilters[i]);
            }
        }
    }

    await runFilterLists();
})();
