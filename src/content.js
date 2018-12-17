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

var clickInteractiveMatchers = [
    {
        'urlRegex': [/tumblr.com\/privacy\/consent/],
        'selector': '.btn.yes'
    },
    {
        'urlRegex': [/guce.oath.com\/collectConsent/],
        'selector': '.btn.agree'
    },
    {
        'urlRegex': [/unileverfoodsolutions.pl/],
        'selector': '.evidon-barrier-acceptbutton'
    },
    {
        'urlRegex': [/downdetector.pl/],
        'selector': '#consentButton'
    },
    {
        'urlRegex': [
            /wikia.com/,
            /fandom.com/
        ],
        'selector': '[data-tracking-opt-in-accept="true"]'
    },
    {
        'urlRegex': [/odr.pl/],
        'selector': '.termsagree'
    },
    {
        'urlRegex': [
            /drogerium.pl/,
            /wylecz.to/,
            /budujmase.pl/
        ],
        'selector': '#accept-targeting-disclaimer-button'
    },
    {
        'urlRegex': [/pfm.pl/],
        'selector': '#NeucaCookieConsent .btn-primary'
    },
    {
        'urlRegex': [
            /rodobox.io/,
            /totalnareklama.pl/
        ],
        'selector': '#_rdbxAcceptAllBtn'
    }
];

function clickInteractiveIterator() {
    for (var i = 0; i < clickInteractiveMatchers.length; ++i) {
        var matcher = clickInteractiveMatchers[i];
        for (var j = 0; j < matcher.urlRegex.length; ++j) {
            if (url.match(matcher.urlRegex[j])) {
                clickInteractive(matcher.selector);
                return;
            }
        }
    }
}
clickInteractiveIterator();


if(url.match(/http:\/\/f1racing.pl/) || url.match(/http:\/\/www.f1racing.pl/))
{
    if(document.cookie.indexOf("x-id-cookie-yes=") == -1)
    {
        window.location = "/x-set-cookie" + location.pathname;
    }
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

if(url=="https://powiatkamienski.pl/")
{
    window.location = "https://powiatkamienski.pl/aktualnosci.dhtml";
}

if(url.match(/gry.lotto.pl/))
{
    addToStorage("rodoConfirmation", true);
}

if(url.match(/totalcasino.pl/))
{
    addToStorage("gdpr_popup", true);
}
