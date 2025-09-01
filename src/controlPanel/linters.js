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

let filtersLinter = cm6.linter(view => {
  let validFunctions = {
    addToStorage: { min: 2, max: 2 },
    bakeCookie: { min: 3, max: 4 },
    clickInteractive: { min: 1, max: 3 },
    clickTimeout: { min: 1, max: 3 },
    clickComplete: { min: 1, max: 3 },
    redirect: { min: 2, max: 3 }
  };

  let found = [];
  let doc = view.state.doc;

  for (let i = 1; i <= doc.lines; i++) {
    let lineInfo = doc.line(i);
    let line = lineInfo.text;
    if (!line || /^(!|#)/.test(line)) continue;

    let match = line.match(/^.*##\+js\(([^)]*)\)/);
    if (!match) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("invalidEntry"),
        severity: "error"
      });
      continue;
    }

    let args = match[1].split(",");
    let funcName = args[0];
    let funcArgsNumber = args.length - 1;
    let from = lineInfo.from + match.index + match[0].indexOf(funcName);

    let funcConfig = validFunctions[funcName];
    if (!funcConfig) {
      found.push({
        from,
        to: from + funcName.length,
        message: PCC_vAPI.i18n.getMessage("invalidFunction", [funcName]),
        severity: "warning"
      });
      continue;
    }

    if (funcArgsNumber > funcConfig.max) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("tooManyArgs"),
        severity: "warning"
      });
    } else if (funcArgsNumber < funcConfig.min) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("tooFewArgs"),
        severity: "error"
      });
    }
  }
  return found;
});

let excludedListLinter = cm6.linter(view => {
  let found = [];
  let doc = view.state.doc;
  let badEntry = /(^[^.]+$)|[^a-z0-9.\-_\[\]:]/;

  for (let i = 1; i <= doc.lines; i++) {
    let lineInfo = doc.line(i);
    let line = lineInfo.text;

    if (badEntry.test(line) && !/^(!|#)/.test(line)) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("invalidEntry"),
        severity: "error"
      });
    }
  }
  return found;
});
