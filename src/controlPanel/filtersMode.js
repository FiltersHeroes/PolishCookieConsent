// Define CodeMirror mode for filters
var filtersMode = cm6.createSimpleMode(
    {
        start: [
            { regex: /#[^#].*/, token: "comment", sol: true },
            { regex: /!.*/, token: "comment", sol: true },
            { regex: /\/.*\//, token: "domainPart", sol: true },
            {
                regex: /([a-zA-Z0-9-]{0,}[a-zA-Z0-9-]\.)+[a-zA-Z0-9\.\/]{0,}/,
                token: "domainPart",
            },
            {
                regex: /#@?#\+js/,
                token: "jsdef",
                next: "jsfunc",
            },
        ],

        jsfunc: [{ regex: /\w+/, token: "func", next: "funcArgs" }],

        funcArgs: [
            { regex: /\)(.*)$/, token: null, next: "start" },
            { regex: /(?:[^\s,()][^,()]*)|\([^)]*\)/, token: "arg" },
            { regex: /,/, token: null },
        ],
        languageData: {
            commentTokens: { line: "#" },
        },
    },
    {
        comment: cm6.tags.lineComment,
        domainPart: cm6.tags.string,
        jsdef: cm6.tags.keyword,
        func: cm6.tags.function(cm6.tags.definition(cm6.tags.variableName)),
        arg: cm6.tags.variableName,
    }
);

// Autocomplete
let functions = {};
let currentLang = PCC_vAPI.i18n.getUILanguage();
(async () => {
    let funcResponse = await fetch(
        PCC_vAPI.runtime.getURL("controlPanel/syntax.json")
    );
    functions.syntax = await funcResponse.json();

    let langShort = currentLang.split('-')[0];
    let functionsTrResponse;

    try {
        let res = await fetch(PCC_vAPI.runtime.getURL(`_locales/${langShort}/functions.json`));
        if (!res.ok) {
            throw new Error('File not found');
        }
        functionsTrResponse = res;
    } catch (e) {
        let res = await fetch(PCC_vAPI.runtime.getURL(`_locales/en/functions.json`));
        functionsTrResponse = res;
    }
    functions.translations = await functionsTrResponse.json();
})();

function parseJsBlockLine(lineText, lineFrom, cursorPos, forHover = false) {
    const jsRegex = /#@?#\+js(\()?/g;
    let match, lastMatch;
    while ((match = jsRegex.exec(lineText)) !== null) {
        if (!forHover || match.index <= cursorPos - lineFrom) lastMatch = match;
    }
    if (!lastMatch) return null;

    const jsStart = lastMatch.index + lastMatch[0].length;
    const inside = lineText.slice(jsStart).trimStart();
    const offset = jsStart + (lineText.slice(jsStart).length - inside.length);

    const funcMatch = inside.match(/^([A-Za-z]\w*)/);
    if (!funcMatch) return null;

    const funcName = funcMatch[1];
    const funcStart = lineFrom + offset;
    const funcEnd = funcStart + funcName.length;

    const argsText = inside.slice(funcName.length);
    const args = [];
    let currentOffset = funcEnd;
    argsText.split(", ").forEach((arg) => {
        if (!arg) return;
        const start =
            lineText.indexOf(arg, currentOffset - lineFrom) + lineFrom;
        args.push({ name: arg, from: start, to: start + arg.length });
        currentOffset = start + arg.length + 2;
    });

    return { funcName, funcStart, funcEnd, args };
}

function renderFunctionInfo(name, data) {
    const dom = document.createElement("div");

    const sig = document.createElement("div");
    sig.textContent = `${name}(${data.args.map((a) => a.name).join(", ")})`;
    sig.classList.add("mb-2");
    sig.style.fontWeight = "600";

    const desc = document.createElement("div");
    desc.textContent = functions.translations[name + "Function"];

    dom.appendChild(sig);
    dom.appendChild(desc);
    return dom;
}

function renderArgInfo(argData) {
    const dom = document.createElement("div");
    dom.textContent = `${argData.name} - ${
        functions.translations[argData.name + "Arg"]
    }`;
    return dom;
}

function pccCompletion(context) {
    const word = context.matchBefore(/\w*/);
    const from = word ? word.from : context.pos;
    const pos = context.pos;

    const line = context.state.doc.lineAt(pos);
    const info = parseJsBlockLine(line.text, line.from, pos, false);

    const beforeCursor = line.text.slice(0, pos - line.from);
    const jsMatch = beforeCursor.match(/#@?#\+js\(?/);

    const hasLetter = word && word.text.length > 0;

    if (context.explicit && jsMatch) {
        const options = Object.entries(functions.syntax.functions).map(
            ([name, data]) => ({
                label: name,
                type: "function",
                apply: name,
                info: () => ({ dom: renderFunctionInfo(name, data) }),
            })
        );
        if (options.length) return { from, options, validFor: /^\w*$/ };
        return null;
    }

    if (!context.explicit && hasLetter && jsMatch) {
        const options = Object.entries(functions.syntax.functions)
            .filter(([name]) => name.startsWith(word.text))
            .map(([name, data]) => ({
                label: name,
                type: "function",
                apply: name,
                iinfo: () => ({ dom: renderFunctionInfo(name, data) }),
            }));
        if (options.length) return { from, options, validFor: /^\w*$/ };
        return null;
    }

    if (!info) return null;
    const { funcName, args } = info;
    const afterFuncText = line.text.slice(info.funcEnd - line.from).trimStart();
    const tokens = afterFuncText.split(", ");
    const argIndex = line.text.slice(0, pos - line.from).endsWith(", ")
        ? tokens.length - 2
        : null;
    if (argIndex === null) return null;

    const argData = functions.syntax.functions[funcName].args[argIndex];
    if (!argData) return null;

    return {
        from: pos,
        options: [
            {
                label: argData.name,
                type: "variable",
                info: functions.translations[argData.name + "Arg"],
                apply: argData.name,
            },
        ],
        validFor: /^\w*$/,
    };
}

// Hover tips
const pccHoverTooltip = cm6.hoverTooltip((view, pos) => {
    if (window.matchMedia("(max-width: 600px)").matches) {
        return;
    }
    const line = view.state.doc.lineAt(pos);
    const info = parseJsBlockLine(line.text, line.from, pos, true);
    if (!info) return null;

    const { funcName, funcStart, funcEnd, args } = info;

    if (pos >= funcStart && pos <= funcEnd) {
        if (!functions.syntax.functions[funcName]) return null;
        return {
            pos: funcStart,
            end: funcEnd,
            above: true,
            create() {
                return {
                    dom: renderFunctionInfo(
                        funcName,
                        functions.syntax.functions[funcName]
                    ),
                };
            },
        };
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (pos >= arg.from && pos <= arg.to) {
            if (
                !functions.syntax.functions[funcName] ||
                !functions.syntax.functions[funcName].args[i]
            )
                return null;
            const argData = functions.syntax.functions[funcName].args[i];
            return {
                pos: arg.from,
                end: arg.to,
                above: true,
                create() {
                    return { dom: renderArgInfo(argData) };
                },
            };
        }
    }

    return null;
});
