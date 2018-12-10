function clickInteractive(element)
{
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "interactive") {
            var btnYes = document.querySelector(element);
            if (btnYes)
            {
                btnYes.click();
            }
        }
    }, 10);
}

function bakeCookie(cookieName, cookieValue, expiresDays)
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

function addToStorage(storageElement, storageValue)
{
    if (localStorage.getItem(storageElement) === undefined || localStorage.getItem(storageElement) === null)
    {
        localStorage.setItem(storageElement, storageValue);
    }
}

var url = location.href;

if(url.match(/http:\/\/f1racing.pl/) || url.match(/http:\/\/www.f1racing.pl/))
{
    if(document.cookie.indexOf("x-id-cookie-yes=") == -1)
    {
        window.location = "/x-set-cookie" + location.pathname;
    }
}

if(url.match(/tumblr.com\/privacy\/consent/))
{
    clickInteractive('.btn.yes');
}

if(url.match(/sportowefakty.wp.pl/) || url.match(/wirtualnemedia.pl/))
{
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            var shadowHost = document.querySelectorAll('.twitter-tweet'), i;
            var cookieConsent = document.querySelector('.twitter-tweet').shadowRoot.querySelector('.Interstitial');
            if(cookieConsent)
            {
                for (i=0; i<shadowHost.length; ++i)
                {
                    shadowHost[i].shadowRoot.querySelector('.Interstitial').remove();
                }
            }
        }
    }, 1000);
}

if(url.match(/gry.pl/))
{
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            var btnYes = document.body.querySelector('div[class*="app_gdpr"] button[class*="intro_acceptAll"]');
            if (document.cookie.indexOf("euconsent=") == -1)
            {
                btnYes.click();
            }
        }
    }, 10);
}

if(url.match(/vivaldi.com/))
{
    bakeCookie("acceptedCookies", "true", "365");
}

if(url.match(/guce.oath.com\/collectConsent/))
{
    clickInteractive('.btn.agree');
}

if(url.match(/unileverfoodsolutions.pl/))
{
    clickInteractive('.evidon-barrier-acceptbutton');
}

if(url.match(/downdetector.pl/))
{
    clickInteractive('#consentButton');
}

if(url.match(/hiszpanskidlapolakow.com/))
{
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "interactive") {
            var btnYes = document.querySelector("#gdpr-accept .btn");
            if (btnYes)
            {
                document.getElementById("facebook").checked = true;
                document.getElementById("disqus").checked = true;
                btnYes.click();
            }
        }
    }, 10);
}

if(url.match(/espedytor.pl/))
{
    bakeCookie("zgodaRODO", "true", "365");
}

if(url.match(/wikia.com/))
{
    clickInteractive('[data-tracking-opt-in-accept="true"]');
}

if(url.match(/odr.pl/))
{
    clickInteractive('.termsagree');
}

if(url.match(/drogerium.pl/) || url.match(/wylecz.to/) || url.match(/budujmase.pl/))
{
    clickInteractive('#accept-targeting-disclaimer-button');
}

if(url.match(/pfm.pl/))
{
    clickInteractive('#NeucaCookieConsent .btn-primary');
}

if(url.match(/rodobox.io/) || url.match(/totalnareklama.pl/))
{
    clickInteractive('#_rdbxAcceptAllBtn');
}

if(url=="https://powiatkamienski.pl/")
{
    window.location = "https://powiatkamienski.pl/aktualnosci.dhtml";
}

if(url.match(/gry.lotto.pl/))
{
    addToStorage("rodoConfirmation", true);
}
