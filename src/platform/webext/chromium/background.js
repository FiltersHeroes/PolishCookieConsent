import './vAPI.js';
import "./updateHelpers.js";
import './update.js';
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if(msg.type === "getStorage") {
        chrome.storage.local.get(msg.key, (result) => sendResponse(result[msg.key]));
        return true;
    }
    if(msg.type === "setStorage") {
        let obj = {};
        obj[msg.key] = msg.value;
        chrome.storage.local.set(obj, () => sendResponse(true));
        return true;
    }
    if(msg.type === "removeStorage") {
        chrome.storage.local.remove(msg.key, () => sendResponse(true));
        return true;
    }
});
