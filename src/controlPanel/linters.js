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

CodeMirror.registerHelper("lint", "filters", function (text) {
    const validFunctions = ["addToStorage", "bakeCookie", "clickInteractive", "clickTimeout", "clickComplete", "redirect"];

    let found = [];
    let lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let funcArgs = line.split("##+js(")[1];

        if (line !== "" && !/^(!|#)/.test(line)) {
            if (funcArgs) {
                let funcName = funcArgs.slice(0, -1).split(",")[0].trim();
                let funcArgsNumber = funcArgs.split(", ").length - 1;
                if (funcName) {
                    if (!new RegExp(validFunctions.join("|")).test(funcName)) {
                        found.push({
                            from: CodeMirror.Pos(i, line.search(new RegExp("\\+js\\(" + funcName)) + 4),
                            to: CodeMirror.Pos(i, line.search(new RegExp("\\+js\\(" + funcName)) + 4 + funcName.length),
                            message: PCC_vAPI.i18n.getMessage("invalidFunction", new Array(funcName)),
                            severity: 'warning'
                        });
                    }
                    else if (
                        (funcName == "addToStorage" && (funcArgsNumber) > 2) ||
                        (funcName == "bakeCookie" && (funcArgsNumber) > 4) ||
                        (new RegExp("redirect|click(Interactive|Complete|Timeout)").test(funcName) && (funcArgsNumber) > 3)
                    ) {
                        found.push({
                            from: CodeMirror.Pos(i, line.search(new RegExp("\\+js\\(" + funcName)) + 4),
                            to: CodeMirror.Pos(i, line.search(new RegExp("\\+js\\(" + funcName)) + 4 + funcArgs.length),
                            message: PCC_vAPI.i18n.getMessage("tooManyArgs"),
                            severity: 'warning'
                        });
                    }
                    else if (
                        (funcName == "addToStorage" && (funcArgsNumber) < 2) ||
                        (funcName == "bakeCookie" && (funcArgsNumber) < 3) ||
                        (funcName == "redirect" && (funcArgsNumber) < 2) ||
                        (new RegExp("click(Interactive|Complete|Timeout)").test(funcName) && (funcArgsNumber) < 1)
                    ) {
                        found.push({
                            from: CodeMirror.Pos(i, line.search(new RegExp("\\+js\\(" + funcName)) + 4),
                            to: CodeMirror.Pos(i, line.search(new RegExp("\\+js\\(" + funcName)) + 4 + funcArgs.length),
                            message: PCC_vAPI.i18n.getMessage("tooFewArgs"),
                            severity: 'error'
                        });
                    }
                }
            }
            else if (!/##\+js\(./.test(line)) {
                found.push({
                    from: CodeMirror.Pos(i, 0),
                    to: CodeMirror.Pos(i, line.length),
                    message: PCC_vAPI.i18n.getMessage("invalidEntry"),
                    severity: 'error'
                });
            }
        }
    }
    return found;
});

CodeMirror.registerHelper("lint", "excludedList", function (text) {
    let found = [];
    let lines = text.split("\n");
    let badEntry = /(^[^.]+$)|[^a-z0-9.\-_\[\]:]/;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (badEntry.test(line)) {
            found.push({
                from: CodeMirror.Pos(i, 0),
                to: CodeMirror.Pos(i, line.length),
                message: PCC_vAPI.i18n.getMessage("invalidEntry"),
                severity: 'error'
            });
        }
    }
    return found;
});
