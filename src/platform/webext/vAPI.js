var PCC_vAPI = PCC_vAPI || {};

(function (global) {
    const api = PCC_vAPI;

    const storageLocal = chrome && chrome.storage && chrome.storage.local;

    api.isWebExtension = () => true;

    api.getVersion = () => chrome.runtime.getManifest().version;

    api.i18n = {
        getMessage: (name, subs) => chrome.i18n.getMessage(name, subs),
        getUILanguage: () => chrome.i18n.getUILanguage()
    };

    api.tabs = {
        create: url => {
            chrome.tabs.create({ url });
        }
    };

    api.storage = {
        local: {
            set: (key, value) => {
                return new Promise((resolve, reject) => {
                    if (storageLocal) {
                        let obj = {};
                        obj[key] = value;
                        storageLocal.set(obj, () => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError));
                            } else {
                                resolve();
                            }
                        });
                    } else if (chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({ type: "setStorage", key, value }, res => resolve(res));
                    } else {
                        reject(new Error("No storage available"));
                    }
                });
            },
            get: key => {
                return new Promise((resolve, reject) => {
                    if (storageLocal) {
                        storageLocal.get(key, result => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError));
                            } else {
                                resolve(result[key]);
                            }
                        });
                    } else if (chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({ type: "getStorage", key }, res => resolve(res));
                    } else {
                        reject(new Error("No storage available"));
                    }
                });
            },
            remove: key => {
                return new Promise((resolve, reject) => {
                    if (storageLocal) {
                        storageLocal.remove(key, () => {
                            if (chrome.runtime.lastError) {
                                reject(new Error(chrome.runtime.lastError));
                            } else {
                                resolve();
                            }
                        });
                    } else if (chrome.runtime && chrome.runtime.sendMessage) {
                        chrome.runtime.sendMessage({ type: "removeStorage", key }, res => resolve(res));
                    } else {
                        reject(new Error("No storage available"));
                    }
                });
            },
            getCache: key => {
                return localStorage.getItem(key);
            },
            setCache: (key, value) => { 
                return localStorage.setItem(key, value);
            }
        }
    };

    api.onFirstRunOrUpdate = (() => {
        let reason = null;
        let resolver = null;

        if (chrome.runtime && chrome.runtime.onInstalled) {
            chrome.runtime.onInstalled.addListener(details => {
                reason = details.reason;
                if (resolver) {
                    resolver(reason);
                    resolver = null;
                }
            });
        }

        return () => new Promise(resolve => {
            if (reason) resolve(reason);
            else resolver = resolve;
        });
    })();

    api.hidePopup = () => {
        if (typeof window !== "undefined" && window.close) {
            window.close();
        }
    };

    api.runtime = {
        getURL: path => chrome.runtime.getURL(path),
        reload: () => chrome.runtime.reload()
    };


    api.notifications = {
        create: (id, iconUrl, title, message) => {
            chrome.notifications.create(id, {
                type: "basic",
                iconUrl,
                title,
                message
            });
        }
    };

    api.runLater = (() => {
        const extensionURL = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.getURL('') : '';
        const isFirefox = extensionURL.startsWith('moz-extension://');
        if (!isFirefox) {
            const ALARM_NAME = "pccDatabasesUpdate";
            let callbackWrapper = null;
            if (chrome.alarms) {
                chrome.alarms.onAlarm.addListener(alarm => {
                    if (alarm.name === ALARM_NAME && callbackWrapper) {
                        callbackWrapper();
                        callbackWrapper = null;
                        chrome.alarms.clear(ALARM_NAME);
                    }
                });
            }

            return (intervalMs, callback) => {
                if (!chrome.alarms) {
                    setTimeout(callback, intervalMs);
                    return;
                }

                callbackWrapper = callback;
                const delayMinutes = Math.max(Math.ceil(intervalMs / 60000), 1);
                chrome.alarms.clear(ALARM_NAME, () => {
                    chrome.alarms.create(ALARM_NAME, { delayInMinutes: delayMinutes });
                });
            };
        }
        else {
            let timerId = null;
            return (intervalMs, callback) => {
                if (timerId) {
                    clearTimeout(timerId);
                    timerId = null;
                }
                timerId = setTimeout(() => {
                    callback();
                    timerId = null;
                }, intervalMs);
            };
        }
    })();

    global.PCC_vAPI = api;

})(typeof self !== "undefined" ? self : window);
