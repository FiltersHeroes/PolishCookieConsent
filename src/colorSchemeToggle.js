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
    if (mode === "dark") {
        rootSelector.classList.add("dark");
        rootSelector.setAttribute("theme", "dark");
        document.addEventListener("DOMContentLoaded", () => {
            let darkThemeToggle = document.querySelector("#darkTheme_toggle");
            if (darkThemeToggle) {
                darkThemeToggle.checked = true;
            }
        });
    } else {
        rootSelector.classList.remove("dark");
        rootSelector.setAttribute("theme", "light")
    }
    let colorSchemeEvent = new CustomEvent("colorSchemeChange", {
        detail: { currentColorScheme: mode }
    });
    document.dispatchEvent(colorSchemeEvent);
}

var currentColorScheme = PCC_vAPI.storage.local.getCache("colorScheme");
if (!currentColorScheme) {
    currentColorScheme = "light";
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentColorScheme = "dark";
    }
}

applyColorScheme(currentColorScheme);

PCC_vAPI.storage.local.get("colorScheme").then(function (colorScheme) {
    if (colorScheme && colorScheme !== currentColorScheme) {
        currentColorScheme = colorScheme;
        applyColorScheme(currentColorScheme);
    }
});

