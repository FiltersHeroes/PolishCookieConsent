// Define CodeMirror mode for filters
CodeMirror.defineSimpleMode("filters", {
    // The start state contains the rules that are initially used
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
        {
            regex: /([a-zA-Z0-9][a-zA-Z0-9-]{0,}[a-zA-Z0-9]\.)+[a-zA-Z\/]{0,}/,
            token: 'domainPart',
        },
        {
            regex: /##\+js/,
            token: 'def',
            next: 'jsfunc'
        },
        {
            regex: /\/.*\//,
            token: 'domainPart',
            sol: true
        },
    ],
    jsfunc: [
        {
            regex: /\w[^,\(]*/,
            token: 'func',
            next: 'funcArgs'
        }
    ],
    funcArgs: [
        {
            regex: /\)$/,
            token: null,
            next: 'start'
        },
        {
            regex: /[^\)\(,]+/,
            token: 'arg'
        }
    ],
    meta: {
        lineComment: "#"
    }
});
