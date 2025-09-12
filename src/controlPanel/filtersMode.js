// Define CodeMirror mode for filters
var filtersMode = cm6.createSimpleMode({
    start: [
      { regex: /#.*/, token: 'comment', sol: true },
      { regex: /!.*/, token: 'comment', sol: true },
      { regex: /([a-zA-Z0-9-]{0,}[a-zA-Z0-9-]\.)+[a-zA-Z0-9\.\/]{0,}/, token: 'domainPart' },
      { regex: /#@?#\+js/, token: 'jsdef', next: 'jsfunc' },
      { regex: /\/.*\//, token: 'domainPart', sol: true }
    ],
    jsfunc: [
      { regex: /\w[^,\(]*/, token: 'func', next: 'funcArgs' }
    ],
    funcArgs: [
      { regex: /\)$/, token: null, next: 'start' },
      { regex: /[^\)\(,]+/, token: 'arg' }
    ],
    languageData: {
      commentTokens: { line: "#" }
    }
});
