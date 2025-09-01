/*******************************************************************************
    Copyright (C) 2025 Filters Heroes
    This file is part of Polish Cookie Consent.

    Polish Cookie Consent is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Polish Cookie Consent is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Polish Cookie Consent. If not, see {http://www.gnu.org/licenses/}.
*/

var PCC_vAPI = PCC_vAPI || {};

(function (global) {
    const api = PCC_vAPI;

    const localStorage = chrome && chrome.storage && chrome.storage.local;

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
                    if (localStorage) {
                        let obj = {};
                        obj[key] = value;
                        localStorage.set(obj, () => {
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
                    if (localStorage) {
                        localStorage.get(key, result => {
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
                    if (localStorage) {
                        localStorage.remove(key, () => {
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
