import {nodeResolve} from "@rollup/plugin-node-resolve";
import pkg from "./package.json" with { type: "json" };

const cm6Version = (pkg.dependencies["@codemirror/view"]).replace(/^[\^~]/, "");


export default {
    input: "editor.js",
    output: {
        file: "../cm6.bundle.js",
        format: "iife",
        name: "cm6",
        banner: `/*!
 * @codemirror/view ${cm6Version}
 * Copyright (C) 2018 by Marijn Haverbeke <marijn@haverbeke.berlin>, Adrian Heine <mail@adrianheine.de>, and others
 * Released under MIT License
 */
//////////////////////////
/*
Generate bundle with
    npx rollup -c
*/
`
  },
    plugins: [nodeResolve()]
}
