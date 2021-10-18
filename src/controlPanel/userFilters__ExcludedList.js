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

function restoreEditorValue(editorID, settingName) {
    PCC_vAPI.storage.local.get(settingName).then(function (result) {
        if (result) {
            editorID.setValue(result);
        }
        else {
            editorID.setValue("");
        }
    });
}

function refreshFocusEditor(editorID, tabID) {
    document.querySelectorAll('[data-mui-controls="' + tabID + '"]').forEach((tabToggle) => {
        tabToggle.addEventListener('mui.tabs.showend', function () {
            editorID.refresh();
            editorID.focus();
            if (editorID == userFilters) {
                CodeMirror.commands.save = function () { saveEditorValue(userFilters, "userFilters", cachedValue, userFiltersApply, userFiltersRevert) };
            } else {
                CodeMirror.commands.save = function () { saveEditorValue(userWhitelist, "whitelist", cachedValue, whitelistApply, whitelistRevert) };
            }
        });
    });
}

// Add user filters to textarea
var userFilters = new CodeMirror(document.querySelector('#myFilters'), {
    autoCloseBrackets: true,
    autofocus: true,
    extraKeys: {
        "Ctrl-/": function (cm) {
            cm.toggleComment();
        },
        'Ctrl-Space': 'autocomplete',
    },
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers'],
    lineNumbers: true,
    lineWrapping: true,
    lint: true,
    matchBrackets: true,
    maxScanLines: 1,
    mode: "filters",
    styleActiveLine: true
});
restoreEditorValue(userFilters, "userFilters");
refreshFocusEditor(userFilters, "my-filters-tab");

// Define CodeMirror mode for excluded list
CodeMirror.defineSimpleMode("excludedList", {
    // The start state contains the rules that are initially used
    start: [
        {
            regex: /#.*/,
            token: 'comment',
            sol: true
        },
        {
            regex: /!.*/,
            token: 'comment',
            sol: true
        },
    ],
    meta: {
        lineComment: "#"
    }
});

// Add excluded list to textarea
var userWhitelist = new CodeMirror(document.querySelector('#userWhitelist'), {
    autofocus: true,
    extraKeys: {
        "Ctrl-/": function (cm) {
            cm.toggleComment();
        }
    },
    gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers'],
    lineNumbers: true,
    lineWrapping: true,
    lint: true,
    mode: "excludedList",
    styleActiveLine: true
});
restoreEditorValue(userWhitelist, "whitelist");
refreshFocusEditor(userWhitelist, "excluded-list-tab");

// Import user filters and excluded list
function importText(textarea) {
    var fp = document.getElementById("importFilePicker");
    fp.addEventListener('change', function () {
        const file = fp.files[0];
        const fr = new FileReader();
        fr.onload = function (e) {
            if (textarea.getValue().length > 0) {
                textarea.setValue([...new Set((textarea.getValue() + "\n" + fr.result).split("\n"))].join("\n"));
            }
            else {
                textarea.setValue(fr.result);
            }
        }
        fr.readAsText(file);
    })
    fp.value = '';
    fp.click();
}
document.querySelector('#userFiltersImport').addEventListener('click', function () {
    importText(userFilters);
});

document.querySelector('#whitelistImport').addEventListener('click', function () {
    importText(userWhitelist);
});

// Export user filters and excluded list
function todayDate() {
    return new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().replace(/\.\d+Z$/, '').replace(/:/g, '.').replace('T', '_');
}

function exportText(field, fileNamePart) {
    // We need an iframe to workaround bug in Waterfox Classic/Firefox<63 on Linux (https://discourse.mozilla.org/t/bug-exporting-files-via-javascript/13116)
    var a = document.querySelector('iframe[src="exportFile.html"]').contentWindow.document.getElementById("download");
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(document.getElementById(field).value);
    a.download = PCC_vAPI.i18n.getMessage("extensionShortName") + "-" + PCC_vAPI.i18n.getMessage(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt";
    a.click();
    a.href = "";
    a.download = "";
}
document.querySelector('#userFiltersExport').addEventListener('click', function () {
    exportText("userFilters", "myFilters");
});

document.querySelector('#whitelistExport').addEventListener('click', function () {
    exportText("userWhitelist", "whitelist");
});

// Revert user filters text area to original value
var userFiltersRevert = document.getElementById("userFiltersRevert");
userFiltersRevert.addEventListener("click", function () {
    restoreEditorValue(userFilters, "userFilters");
});

// Revert excluded list text area to original value
var whitelistRevert = document.getElementById("whitelistRevert");
whitelistRevert.addEventListener("click", function () {
    restoreEditorValue(userWhitelist, "whitelist");
});

// Save editor values
var cachedValue = {
    userFilters: '',
    whitelist: ''
};

function saveEditorValue(editor, settingName, cachedValue, applyBtn, revertBtn) {
    editor.setValue([...new Set(editor.getValue().toString().split("\n"))].join("\n").trim());
    cachedValue[settingName] = editor.getValue();
    PCC_vAPI.storage.local.set(settingName, cachedValue[settingName]);
    applyBtn.disabled = true;
    revertBtn.disabled = true;
};

// Save user filters
var userFiltersApply = document.getElementById("userFiltersApply");
document.querySelector("#userFiltersApply").addEventListener("click", function () {
    saveEditorValue(userFilters, "userFilters", cachedValue, userFiltersApply, userFiltersRevert);
});

// Save excluded list
var whitelistApply = document.getElementById("whitelistApply");
document.querySelector("#whitelistApply").addEventListener("click", function () {
    saveEditorValue(userWhitelist, "whitelist", cachedValue, whitelistApply, whitelistRevert);
});


// Disable/enable submit and revert buttons
function toggleSubmitRevertBtn(applyBtn, revertBtn, editor, cachedValue, savedValue) {
    PCC_vAPI.storage.local.get(savedValue).then(function (result) {
        if (cachedValue[savedValue] !== '') {
            result = cachedValue[savedValue];
            cachedValue[savedValue] = '';
        }
        if (editor.getValue() == result) {
            applyBtn.disabled = true;
            revertBtn.disabled = true;
        }
        else {
            applyBtn.disabled = false;
            revertBtn.disabled = false;
        }
    })
}


// Disable/enable submit and revert user filters buttons
userFilters.on('changes', function () {
    toggleSubmitRevertBtn(userFiltersApply, userFiltersRevert, userFilters, cachedValue, "userFilters");
});

// Disable/enable submit and revert excluded list buttons
userWhitelist.on('changes', function () {
    toggleSubmitRevertBtn(whitelistApply, whitelistRevert, userWhitelist, cachedValue, "whitelist");
});
