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

var url = location.href;

if(url.match(/http:\/\/f1racing.pl/))
{
    if (document.cookie.indexOf("x-id-cookie-yes=") == -1)
    {
        window.location = "http://f1racing.pl/x-set-cookie" + location.pathname;
    }
}

if(url.match(/http:\/\/www.f1racing.pl/))
{
    if (document.cookie.indexOf("x-id-cookie-yes=") == -1)
    {
        window.location = "http://www.f1racing.pl/x-set-cookie" + location.pathname;
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
            var cookieConsent = document.querySelectorAll('.twitter-tweet /deep/ .Interstitial'), i;
            for (i = 0; i < cookieConsent.length; ++i) {
                cookieConsent[i].remove();
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
    if (document.cookie.indexOf("acceptedCookies=") == -1)
    {
        document.cookie = "acceptedCookies=true; path=/;";
        location.reload();
    }
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
    if (document.cookie.indexOf("zgodaRODO=") == -1)
    {
        document.cookie = "zgodaRODO=true; expires=Thu, 18 Dec 2023 12:00:00 UTC;";
        location.reload();
    }
}

if(url.match(/wikia.com/) || url.match(/fandom.com/))
{
    clickInteractive('[data-tracking-opt-in-accept="true"]');
}

if(url.match(/odr.pl/))
{
    clickInteractive('.termsagree');
}

if(url.match(/drogerium.pl/) || url.match(/wylecz.to/))
{
    clickInteractive('#accept-targeting-disclaimer-button');
}
