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

function clickInteractive(element, urlArg, cookieName)
{
    if(getUrlCondition(urlArg))
    {
        document.onreadystatechange = function () {
            if (document.readyState === "interactive") {
                var counter = 0;
                (function checkIfElemExists() {
                    var btnYes = document.querySelector(element);
                    var condition;
                    if (cookieName)
                    {
                        condition = document.cookie.indexOf(cookieName+"=") == -1;
                    }
                    else
                    {
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
        window.onload = () => {
            var counter = 0;
            (function checkIfElemExists() {
                var btnYes = document.evaluate("//"+element+"[contains(text(), "+'"'+text+'"'+")]", document, null, XPathResult.ANY_TYPE, null).iterateNext();
                if (counter < 100 && btnYes == null) {
                    window.requestAnimationFrame(checkIfElemExists);
                    counter++;
                } else if (btnYes) {
                    btnYes.click()
                }
            })()
        }
    }
}

function clickTimeout(element, urlArg)
{
    if(getUrlCondition(urlArg))
    {
        (function checkIfElemExists() {
            var btnYes = document.querySelector(element);
            if (btnYes == null) {
                window.requestAnimationFrame(checkIfElemExists);
            } else if (btnYes) {
                btnYes.click()
            }
        })()
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

addToStorage("gdpr_popup", "true", "totalcasino.pl");
addToStorage("rodoConfirmation", "true", "gry.lotto.pl");
addToStorage("rodoConfirmation2", "true", "gry.lotto.pl");
bakeCookie("acceptedCookies", "true", "365", "vivaldi.com");
bakeCookie("acceptRodoSie", "hide", "365", "login.e-dowod.gov.pl");
bakeCookie("euConsent", "1", "365", "virustotal.com");
bakeCookie("gdpr", "1", "365", "sklep.visionexpress.pl");
bakeCookie("hm_gdpr_read", "true", "365", "www2.hm.com");
bakeCookie("tracking-opt-in-status", "accepted", "365", "wikia.com|fandom.com");
bakeCookie("zgodaRODO", "true", "365", "espedytor.pl");
bakeCookie("CookieConsent", "true", "365", "action.com");
bakeCookie("gdpr-accepted", '{"ga":true,"facebook":true,"disqus":true}', "365", "hiszpanskidlapolakow.com");
bakeCookie("inforCookieWallCacheVal", "15", "365", "infor.pl");
bakeCookie("num26GDPR", "ACCEPTED", "365", "n26.com");
bakeCookie("regulationsAccepted", "true", "365", "mapy.geoportal.gov.pl");
bakeCookie("rodoHfM", "true", "365", "drogerium.pl|wylecz.to|budujmase.pl");
bakeCookie("rodo", "accept", "365", "laziska.com.pl|m-ce.pl|mojbytom.pl|mojegliwice.pl|mojekatowice.pl|mojmikolow.pl|orzesze.com.pl|piekaryslaskie.com.pl|pyskowice.com.pl|rudaslaska.com.pl|rybnicki.com|siemianowice.net.pl|sosnowiecki.pl|swiony.pl|wodzislaw.com.pl|zabrze.com.pl|zory.com.pl|silesia.info.pl");
bakeCookie("notice_gdpr_prefs", "0,1,2,3:", "365", "wunderground.com");
bakeCookie("notice_poptime", "1533920400000", "365", "wunderground.com");
bakeCookie("__rppl_rodo_agrmnt", "%7B%22u%22%3A%22%22%2C%22t%22%3A1561121871557%2C%22c%22%3A%221%22%7D", "365", "rp.pl|parkiet.com");
clickComplete('div[class*="app_gdpr"] button[class*="intro_acceptAll"]', "gry.pl", "euconsent");
clickCompleteText("button", "PRZECHODZ", "abczdrowie.pl|allani.pl|autokult.pl|dobramama.pl|dobreprogramy.pl|domodi.pl|echirurgia.pl|fotoblogia.pl|gadzetomania.pl|homebook.pl|jejswiat.pl|kafeteria.pl|kafeteria.tv|kardiolo.pl|komorkomania.pl|luxlux.pl|medycyna24.pl|mixer.pl|money.pl|nocowanie.pl|nerwica.com|o2.pl|open.fm|parenting.pl|pinger.pl|pogodnie.pl|pudelek.pl|pudelek.tv|pudelekx.pl|pytamy.pl|smaczneblogi.pl|samosia.pl|smog.pl|snobka.pl|superauto24.com|testwiedzy.pl|wp.pl");
clickInteractive("#_rdbxAcceptAllBtn", "rodobox.io|totalnareklama.pl", "rodobox");
clickInteractive(".btn.yes", "tumblr.com\/privacy\/consent");
clickInteractive(".evidon-barrier-acceptbutton", "unileverfoodsolutions.pl|downdetector.pl");
clickInteractive(".termsagree", "odr.pl");
clickTimeout('.btn[name="agree"]', "guce.oath.com\/collectConsent|consent.yahoo.com\/collectConsent");
redirect("/aktualnosci.dhtml", "", "=https://powiatkamienski.pl/");
redirect("/x-set-cookie", "true", "f1racing.pl", "x-id-cookie-yes=");
redirect("/home.html", "", "=http://centrumkomputerowe.eu/");
