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

    let match = line.match(/[^#]+##\+js\(([^)]*)\)$/);
    if (!match) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("invalidEntry"),
        severity: "error"
      });
      continue;
    }

    let args = match[1].split(", ");
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
