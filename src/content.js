var url = location.href;

function getUrlCondition(urlArg)
{
    var condition;
    if(urlArg.match("="))
    {
        condition = url==urlArg.replace("=", "");
    }
    else
    {
        condition = url.match(RegExp(urlArg));
    }
    return condition;
}

function clickInteractive(element, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "interactive") {
                var btnYes = document.querySelector(element);
                if (btnYes)
                {
                    btnYes.click();
                    clearInterval(readyStateCheckInterval);
                }
            }
        }, 10);
    }
}

function clickComplete(element, urlArg, cookieName)
{
    if(getUrlCondition(urlArg))
    {
        document.onreadystatechange = function () {
            if (document.readyState === "complete") {
                var btnYes = document.querySelector(element);
                if (document.cookie.indexOf(cookieName+"=") == -1)
                {
                    btnYes.click();
                }
            }
        }
    }
}

function clickCompleteText(element, text, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        document.onreadystatechange = function () {
            setTimeout(function() {
                var btnYes = document.evaluate("//"+element+"[contains(text(),"+"'"+text+"'"+")]", document  || document, null, XPathResult.ANY_TYPE, null).iterateNext();
                if (btnYes)
                {
                    btnYes.click();
                }
            }, 500);
        }
    }
}

function clickTimeout(element, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        setTimeout(function() {
            var btnYes = document.querySelector(element);
            if (btnYes)
            {
                btnYes.click();
            }
        }, 500);
    }
}

function bakeCookie(cookieName, cookieValue, expiresDays, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        if (document.cookie.indexOf(cookieName+"=") == -1)
        {
            var d = new Date();
            d.setTime(d.getTime() + (expiresDays*24*60*60*1000));
            var expires = "expires="+ d.toUTCString();
            document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/";
            location.reload();
        }
    }
}

function addToStorage(storageElement, storageValue, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        if (localStorage.getItem(storageElement) === undefined || localStorage.getItem(storageElement) === null)
        {
            localStorage.setItem(storageElement, storageValue);
        }
    }
}


function redirect(redirectPoint, pathName, urlArg, cookieName)
{
    if(getUrlCondition(urlArg))
    {
        if(document.cookie.indexOf(cookieName) == -1)
        {
            if(pathName=="true")
            {
                window.location = redirectPoint + location.pathname;
            }
            else
            {
                window.location = redirectPoint;
            }
        }
    }
}

function removeFromShadow(shadowHostArg, element, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "complete") {
                var shadowHost = document.querySelectorAll(shadowHostArg);
                if(shadowHost[0])
                {
                    var cookieConsent = document.querySelector(shadowHostArg).shadowRoot.querySelector(element);
                    if(cookieConsent)
                    {
                        for (var i=0; i<shadowHost.length; ++i)
                        {
                            shadowHost[i].shadowRoot.querySelector(element).remove();
                        }
                    }
                    clearInterval(readyStateCheckInterval);
                }
            }
        }, 1000);
    }
}

addToStorage("gdpr_popup", "true", "totalcasino.pl");
addToStorage("rodoConfirmation", "true", "gry.lotto.pl");
bakeCookie("acceptedCookies", "true", "365", "vivaldi.com");
bakeCookie('acceptRodoSie', 'hide', '365', 'login.e-dowod.gov.pl');
bakeCookie("gdpr", "1", "365", "sklep.visionexpress.pl");
bakeCookie("tracking-opt-in-status", "accepted", "365", 'wikia.com|fandom.com');
bakeCookie("zgodaRODO", "true", "365", "espedytor.pl");
bakeCookie('CookieConsent', 'true', '365', 'action.com');
bakeCookie('gdpr-accepted', '{"ga":true,"facebook":true,"disqus":true}', '365', 'hiszpanskidlapolakow.com');
bakeCookie('num26GDPR', 'ACCEPTED', '365', 'n26.com');
bakeCookie('regulationsAccepted', 'true', '365', 'mapy.geoportal.gov.pl');
bakeCookie('rodoHfM', 'true', '365', 'drogerium.pl|wylecz.to|budujmase.pl');
clickComplete('div[class*="app_gdpr"] button[class*="intro_acceptAll"]', "gry.pl", "euconsent");
clickCompleteText("button", "PRZECHODZ", "wp.pl|homebook.pl|dobreprogramy.pl");
clickInteractive('#NeucaCookieConsent .btn-primary', 'pfm.pl');
clickInteractive('#_rdbxAcceptAllBtn', 'rodobox.io|totalnareklama.pl');
clickInteractive('.btn.yes', 'tumblr.com\/privacy\/consent');
clickInteractive('.evidon-barrier-acceptbutton', 'downdetector.pl|unileverfoodsolutions.pl');
clickInteractive('.termsagree', 'odr.pl');
clickTimeout('.btn[name="agree"]', 'guce.oath.com\/collectConsent');
redirect("/aktualnosci.dhtml", "", "=https://powiatkamienski.pl/");
redirect("/x-set-cookie", "true", "f1racing.pl", "x-id-cookie-yes=");
removeFromShadow(".twitter-tweet", ".Interstitial", "sportowefakty.wp.pl|wirtualnemedia.pl");
