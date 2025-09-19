import babel from "@rollup/plugin-babel"
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json" with { type: "json" };
import commonjs from '@rollup/plugin-commonjs';


function getDepVersion(depName) {
  const version = pkg.dependencies?.[depName] 
               || pkg.devDependencies?.[depName] 
               || pkg.peerDependencies?.[depName];
  if (!version) {
    throw new Error(`Nie znaleziono wersji dla "${depName}"`);
  }
  return version.replace(/^[\^~]/, "");
}

function getCodemirrorDeps() {
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  return Object.entries(allDeps)
    .filter(([name]) => name.startsWith("@codemirror/"))
    .sort(([a], [b]) => a.localeCompare(b)) // sortowanie alfabetyczne
    .map(([name]) => ` * ${name} ${getDepVersion(name)}`);
}

export default {
  input: "editor.js",
  output: {
    file: "../../src/thirdparty/cm6.bundle.js",
    format: "iife",
    name: "cm6",
    banner: `/*!
${getCodemirrorDeps().join("\n")}
 * @lezer/highlight ${getDepVersion("@lezer/highlight")}
 * Copyright (C) 2018 by Marijn Haverbeke <marijn@haverbeke.berlin>, Adrian Heine <mail@adrianheine.de>, and others
 * Released under MIT License
 */
//////////////////////////
/*
 * @uiw/codemirror-theme-okaidia ${getDepVersion("@uiw/codemirror-theme-okaidia")}
 * Copyright (c) 2021 uiw
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
