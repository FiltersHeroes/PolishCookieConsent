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
let rootSelector = document.querySelector(":root");
PCC_vAPI.storage.local.get("colorScheme").then(function (colorScheme) {
    let condition;
    if (colorScheme) {
        condition = colorScheme == "dark";
    } else {
        condition = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    if (condition) {
        rootSelector.classList.add("dark");
        let darkThemeToggle = document.querySelector("#darkTheme_toggle");
        if (darkThemeToggle) {
            darkThemeToggle.checked = true;
        }
    } else {
        if (rootSelectorclassList.contains("dark")) {
            rootSelector.classList.remove("dark");
        }
    }
});

