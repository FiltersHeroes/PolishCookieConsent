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

// Apply dark theme
function applyColorScheme(mode) {
    let rootSelector = document.documentElement;
    let chosenTheme = "light";
    if (mode === "dark") {
        chosenTheme = mode;
    }
    rootSelector.setAttribute("theme", chosenTheme);
    let colorSchemeEvent = new CustomEvent("colorSchemeChange", {
        detail: { currentColorScheme: mode }
    });
    document.dispatchEvent(colorSchemeEvent);
}

let currentColorScheme = "light";
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentColorScheme = "dark";
}
applyColorScheme(currentColorScheme);
let savedCurrentColorScheme = PCC_vAPI.storage.local.getCache("colorScheme");
if (savedCurrentColorScheme && savedCurrentColorScheme != "auto") {
    currentColorScheme = savedCurrentColorScheme;
}
applyColorScheme(currentColorScheme);


PCC_vAPI.storage.local.get("colorScheme").then(function (colorScheme) {
    if (colorScheme && colorScheme !== currentColorScheme && colorScheme != "auto") {
        currentColorScheme = colorScheme;
        applyColorScheme(currentColorScheme, true);
    }
});
