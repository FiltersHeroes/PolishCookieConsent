import babel from "@rollup/plugin-babel"
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json" with { type: "json" };
import commonjs from '@rollup/plugin-commonjs';

const cm6Version = (pkg.dependencies["@codemirror/view"]).replace(/^[\^~]/, "");


export default {
  input: "editor.js",
  output: {
    file: "../../src/thirdparty/cm6.bundle.js",
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
    pnpm rum build
*/
`
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    })
  ]
}
