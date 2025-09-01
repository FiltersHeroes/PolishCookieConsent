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

function restoreEditorValue(editorID, settingName) {
    PCC_vAPI.storage.local.get(settingName).then(function (result) {
        var value = "";
        if (result) {
            value = result;
        }
        cm6.setValue(editorID, value);
    });
}

function refreshFocusEditor(editorID, tabID) {
    document.querySelectorAll(`[data-mui-controls="${tabID}"]`).forEach((tabToggle) => {
        tabToggle.addEventListener('mui.tabs.showend', function () {
            editorID.requestMeasure();
            editorID.focus();
            if (editorID == userFilters) {
                cm6.onSave(editorID, () => {
                    saveEditorValue(userFilters, "userFilters", cachedValue, userFiltersApply, userFiltersRevert);
                });
            } else {
                cm6.onSave(editorID, () => {
                    saveEditorValue(userWhitelist, "whitelist", cachedValue, whitelistApply, whitelistRevert);
                });
            }
        });
    });
}


// Add user filters to textarea
var userFilters = cm6.createEditor({
    parent: document.querySelector("#myFilters"),
    doc: "",
    extensions: [
        filtersMode,
        filtersLinter,
        cm6.lintGutter(),
        cm6.lineNumbers(),
        cm6.highlightActiveLine(),
        cm6.highlightActiveLineGutter(),
        cm6.drawSelection(),
        cm6.commands.history(),
        cm6.bracketMatching(),
        cm6.closeBrackets(),
        cm6.highlightSelectionMatches(),
        cm6.keymap.of([
            ...cm6.closeBracketsKeymap,
            ...cm6.commands.defaultKeymap,
            ...cm6.commands.historyKeymap,
        ]),
    ],
    autofocus: true
});

restoreEditorValue(userFilters, "userFilters");
refreshFocusEditor(userFilters, "my-filters-tab");

// Define CodeMirror mode for excluded list
var excludedListMode = cm6.createSimpleMode({
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
    languageData: {
      commentTokens: { line: "#" }
    }
});

// Add excluded list to textarea
var userWhitelist = cm6.createEditor({
    doc: "",
    extensions: [
        excludedListMode,
        excludedListLinter,
        cm6.lintGutter(),
        cm6.lineNumbers(),
        cm6.highlightActiveLine(),
        cm6.highlightActiveLineGutter(),
        cm6.drawSelection(),
        cm6.commands.history(),
        cm6.bracketMatching(),
        cm6.closeBrackets(),
        cm6.highlightSelectionMatches(),
        cm6.keymap.of([
            ...cm6.commands.defaultKeymap,
        ]),
    ],
    parent: document.querySelector("#userWhitelist"),
    autofocus: true
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
            if (cm6.getValue(textarea).length > 0) {
                cm6.setValue(textarea, [...new Set((cm6.getValue(textarea) + "\n" + fr.result).split("\n"))].join("\n"));
            }
            else {
                cm6.setValue(textarea, fr.result);
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
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(field.getValue());
    a.download = PCC_vAPI.i18n.getMessage("extensionShortName") + "-" + PCC_vAPI.i18n.getMessage(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt";
    a.click();
    a.href = "";
    a.download = "";
}
document.querySelector('#userFiltersExport').addEventListener('click', function () {
    exportText(userFilters, "myFilters");
});

document.querySelector('#whitelistExport').addEventListener('click', function () {
    exportText(userWhitelist, "whitelist");
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
    cachedValue[settingName] = editor.state.doc.toString();
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
        if (editor.state.doc.toString() == result) {
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
cm6.onChange(userFilters, () => {
    toggleSubmitRevertBtn(userFiltersApply, userFiltersRevert, userFilters, cachedValue, "userFilters");
});

// Disable/enable submit and revert excluded list buttons
cm6.onChange(userWhitelist, () => {
    toggleSubmitRevertBtn(whitelistApply, whitelistRevert, userWhitelist, cachedValue, "whitelist");
});
