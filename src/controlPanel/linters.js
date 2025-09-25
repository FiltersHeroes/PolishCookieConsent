let filtersLinter = cm6.linter((view) => {
  const validFunctions = {
    addToStorage: { min: 2, max: 2 },
    addToSessionStorage: { min: 2, max: 2 },
    bakeCookie: { min: 2, max: 4 },
    clickInteractive: { min: 1, max: 3 },
    clickTimeout: { min: 1, max: 3 },
    clickComplete: { min: 1, max: 3 },
    redirect: { min: 2, max: 3 },
  };

  const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+(?:\/[\w.\-\/]*)?$/;

  const isValidDomainOrRegex = (d) => {
    const trimmed = d.trim();
    return domainRegex.test(trimmed) || /^\/.{3,}\/$/.test(trimmed);
  };

  let found = [];
  const doc = view.state.doc;

  for (let i = 1; i <= doc.lines; i++) {
    const lineInfo = doc.line(i);
    const line = lineInfo.text;

    if (!line || /^(!|#[^#])/.test(line)) continue;

    const parts = line.split(/#@?#\+js/);
    const domainPart = parts[0].trim();

    if (!domainPart) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("missingDomain"),
        severity: "error",
      });
      continue;
    }

    const domains = domainPart.split(",");
    const invalidDomain = domains.find((d) => !isValidDomainOrRegex(d));

    if (invalidDomain === "" && domains.length > 1) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("invalidDomain", [
          domains[domains.length - 2].trim(),
        ]),
        severity: "error",
      });
      continue;
    } else if (invalidDomain) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("invalidDomain", [
          invalidDomain.trim(),
        ]),
        severity: "error",
      });
      continue;
    }

    const jsMatch = line.match(/#@?#\+js\((.*)\)$/);
    if (!jsMatch || !jsMatch[1].includes(", ")) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("invalidEntry"),
        severity: "error",
      });
      continue;
    }

    const args = jsMatch[1].split(", ");
    const funcName = args[0];
    const funcArgsNumber = args.length - 1;
    const from = lineInfo.from + line.indexOf(funcName);

    const funcConfig = validFunctions[funcName];
    if (!funcConfig) {
      found.push({
        from,
        to: from + funcName.length,
        message: PCC_vAPI.i18n.getMessage("invalidFunction", [
          funcName,
        ]),
        severity: "warning",
      });
      continue;
    }

    if (funcArgsNumber > funcConfig.max) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("tooManyArgs"),
        severity: "warning",
      });
    } else if (funcArgsNumber < funcConfig.min) {
      found.push({
        from: lineInfo.from,
        to: lineInfo.to,
        message: PCC_vAPI.i18n.getMessage("tooFewArgs"),
        severity: "error",
      });
    }
  }
  return found;
});

let excludedListLinter = cm6.linter((view) => {
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
        severity: "error",
      });
    }
  }
  return found;
});
