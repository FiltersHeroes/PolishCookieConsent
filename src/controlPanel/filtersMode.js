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
            regex: /([a-zA-Z0-9-]{0,}[a-zA-Z0-9-]\.)+[a-zA-Z0-9\.\/]{0,}/,
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
