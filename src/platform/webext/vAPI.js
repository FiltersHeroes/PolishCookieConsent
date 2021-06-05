var PCC_vAPI = {
    isWebExtension: () => {
        return true;
    },
    getVersion: () => {
        return chrome.runtime.getManifest().version;
    },
    i18n: {
        getMessage: (messageName, subs) => {
            return chrome.i18n.getMessage(messageName, subs);
        },
        getUILanguage: () => {
            return chrome.i18n.getUILanguage();
        }
    },
    tabs: {
        create: (url) => {
            chrome.tabs.create({ url: url });
        }
    },
    storage: {
        local: {
            set: (name, value) => {
                let obj = {};
                obj[name] = value;
                return new Promise(function (resolve, reject) {
                    resolve(chrome.storage.local.set(obj));
                });
            },
            get: (name) => {
                return new Promise(function (resolve, reject) {
                    chrome.storage.local.get(name, function (result) {
                        resolve(result[name]);
                    });
                });
            }
        }
    },
    onFirstRunOrUpdate: () => {
        return new Promise(function (resolve, reject) {
            chrome.runtime.onInstalled.addListener(function (details) {
                resolve(details.reason);
            })
        });
    },
    hidePopup: () => {
        window.close();
    },
    runtime: {
        getURL: (path) => {
            return chrome.runtime.getURL(path);
        }
    },
    notifications: {
        create: (id, iconURL, title, message) => {
            chrome.notifications.create(id, {
                "type": "basic",
                "iconUrl": iconURL,
                "title": title,
                "message": message
            });
        }
    }
}
