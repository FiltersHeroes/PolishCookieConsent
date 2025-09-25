function restoreEditorValue(editorID, settingName) {
    PCC_vAPI.storage.local.get(settingName).then(function (result) {
        var value = "";
        if (result) {
            value = result;
        }
        cm6.setValue(editorID, value);
    });
}

// Add user filters to textarea
var userFilters = cm6.createEditor({
    parent: document.querySelector("#myFilters"),
    doc: "",
    extensions: [
        ...cm6.commonExtensions,
        filtersMode,
        filtersLinter,
        cm6.lintGutter(),
        cm6.commands.history(),
        cm6.keymap.of([
            ...cm6.completionKeymap,
            ...cm6.closeBracketsKeymap,
            ...cm6.commands.defaultKeymap,
            ...cm6.commands.historyKeymap,
        ]),
        cm6.autocompletion({ override: [pccCompletion] }),
        pccHoverTooltip
    ],
    autofocus: true
});


restoreEditorValue(userFilters, "userFilters");

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
        ...cm6.commonExtensions,
        excludedListMode,
        excludedListLinter,
        cm6.lintGutter(),
        cm6.commands.history(),
        cm6.keymap.of([
            ...cm6.closeBracketsKeymap,
            ...cm6.commands.defaultKeymap,
            ...cm6.commands.historyKeymap,
        ]),
    ],
    parent: document.querySelector("#userWhitelist"),
    autofocus: true,
});

restoreEditorValue(userWhitelist, "whitelist");

// Focus editor and set correct cursor position
document.addEventListener('tabVisible', function (e) {
    let currentEditor = "";
    if (e.detail.id == "excluded-list-tab") {
        currentEditor = userWhitelist
    }
    else if (e.detail.id == "my-filters-tab") {
        currentEditor = userFilters;
    }
    if (currentEditor != "") {
        currentEditor.dispatch({
            selection: { anchor: currentEditor.state.doc.length }
        });
        currentEditor.requestMeasure();
        currentEditor.focus();
    }
});

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
    const blob = new Blob([cm6.getValue(field)], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = PCC_vAPI.i18n.getMessage("extensionShortName") + "-" + PCC_vAPI.i18n.getMessage(fileNamePart).replace(" ", "-").toLowerCase() + "_" + todayDate() + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
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
cm6.onSave(userFilters, () => {
    saveEditorValue(userFilters, "userFilters", cachedValue, userFiltersApply, userFiltersRevert);
});


// Save excluded list
var whitelistApply = document.getElementById("whitelistApply");
document.querySelector("#whitelistApply").addEventListener("click", function () {
    var excludedListValue = userWhitelist.state.doc.toString();
    var sortedExcludedList = excludedListValue.split("\n").sort().join("\n");
    cm6.setValue(userWhitelist, sortedExcludedList);
    saveEditorValue(userWhitelist, "whitelist", cachedValue, whitelistApply, whitelistRevert);
});
cm6.onSave(userWhitelist, () => {
    saveEditorValue(userWhitelist, "whitelist", cachedValue, whitelistApply, whitelistRevert);
});


// Disable/enable submit and revert buttons
async function toggleSubmitRevertBtn(applyBtn, revertBtn, editor, cachedValue, savedValue) {
    var result = await PCC_vAPI.storage.local.get(savedValue);
    if (cachedValue[savedValue] !== '') {
        result = cachedValue[savedValue];
        cachedValue[savedValue] = '';
    }
    if (result === undefined) {
        result = "";
    }
    if (editor.state.doc.toString() == result) {
        applyBtn.disabled = true;
        revertBtn.disabled = true;
    }
    else {
        applyBtn.disabled = false;
        revertBtn.disabled = false;
    }
}


// Disable/enable submit and revert user filters buttons
cm6.onChange(userFilters, async () => {
    await toggleSubmitRevertBtn(userFiltersApply, userFiltersRevert, userFilters, cachedValue, "userFilters");
});

// Disable/enable submit and revert excluded list buttons
cm6.onChange(userWhitelist, async () => {
    await toggleSubmitRevertBtn(whitelistApply, whitelistRevert, userWhitelist, cachedValue, "whitelist");
});
