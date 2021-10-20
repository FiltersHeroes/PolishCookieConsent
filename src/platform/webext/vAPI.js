/*******************************************************************************
    Copyright (C) 2021 Filters Heroes
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
            },
            remove: (name) => {
                return new Promise(function (resolve, reject) {
                    chrome.storage.local.remove(name, function () {
                        var error = chrome.runtime.lastError;
                        if (error) {
                            reject(new Error(error));
                        } else {
                            resolve();
                        }
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
        },
        reload: () => {
            chrome.runtime.reload();
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
