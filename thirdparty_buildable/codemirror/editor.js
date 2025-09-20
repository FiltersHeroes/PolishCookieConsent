// Core
import { EditorState, StateEffect, EditorSelection, Compartment } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, keymap, hoverTooltip } from '@codemirror/view';

// Commands / history
import * as commands from "@codemirror/commands"

// Language system
import { bracketMatching, StreamLanguage, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { tags, classHighlighter } from "@lezer/highlight";
import { simpleMode } from '@codemirror/legacy-modes/mode/simple-mode';

// Linter
import { lintGutter, linter } from "@codemirror/lint";

// Search
import { highlightSelectionMatches, SearchCursor, RegExpCursor, search } from '@codemirror/search';

// Autocomplete / Brackets
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from "@codemirror/autocomplete";

import { okaidia as darkTheme } from '@uiw/codemirror-theme-okaidia';

// ================= Helpers =================
export function setValue(editor, value) {
  editor.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: value
    }
  });
}

export function getValue(editor) {
  return editor.state.doc.toString();
}

export function onChange(editor, callback) {
  editor.dispatch({
    effects: StateEffect.appendConfig.of(
      EditorView.updateListener.of(update => {
        if (update.docChanged) callback(editor, update);
      })
    )
  });
}

export function onSave(editor, callback) {
  editor.save = () => callback(editor);

  editor.dispatch({
    effects: StateEffect.appendConfig.of(
      keymap.of([
        {
          key: "Mod-s",
          run: () => {
            if (editor.save) editor.save();
            return true;
          }
        }
      ])
    )
  });
}

export function createSimpleMode(states, tokenToTag = {}) {
  const { languageData = {}, ...pureStates } = states;

  const tokenTable = {};
  for (const token in tokenToTag) {
    tokenTable[token] = tokenToTag[token];
  }

  const simpleModeDef = simpleMode({
    ...pureStates,
    languageData,
  });
  simpleModeDef.tokenTable = tokenTable;

  const language = StreamLanguage.define(simpleModeDef);
  const highlighter = syntaxHighlighting(classHighlighter);

  return new LanguageSupport(language, [highlighter]);
}

export function createEditor(config = {}) {
  let themeCompartment = new Compartment();
  let lightTheme = EditorView.theme({}, { dark: false });


  function getCurrentTheme(colorScheme) {
    let chosenTheme = lightTheme;
    if (colorScheme == "dark") {
      chosenTheme = darkTheme;
    }
    return chosenTheme;
  }

  let colorScheme = "light"
  let rootSelector = document.documentElement;
  if (rootSelector && rootSelector.getAttribute("theme") == "dark") {
    colorScheme = "dark";
  }
  let currentTheme = getCurrentTheme(colorScheme);

  var editorState = EditorState.create({
    doc: config.doc || "",
    extensions: [
      [...(config.extensions || []),
      themeCompartment.of(currentTheme)],
    ]
  });

  var editorView = new EditorView({
    state: editorState,
    parent: config.parent,
    autofocus: config.autofocus !== false
  });
  document.addEventListener("colorSchemeChange", (e) => {
    currentTheme = getCurrentTheme(e.detail.currentColorScheme);
    editorView.dispatch({ effects: themeCompartment.reconfigure(currentTheme) })
  });
  return editorView;
}

export function initCustomSearch(editorView, searchInput, counter, nextBtn, prevBtn, caseBtn) {
  let matches = [];
  let currentIndex = -1;
  let caseSensitive = false;

  function createSearchQuery(text, caseSensitive) {
    let isRegexp = false;
    let searchText = text;

    const regexMatch = text.match(/^\/(.+)\/([a-z]*)$/);
    if (regexMatch) {
      isRegexp = true;
      searchText = regexMatch[1];
    }

    return { searchText, isRegexp, caseSensitive };
  }

  function collectMatches(state, query) {
    let results = [];
    if (!query.searchText) return results;

    let cursor;

    if (query.isRegexp) {
      const options = { ignoreCase: !query.caseSensitive };
      cursor = new RegExpCursor(state.doc, query.searchText, options, 0, state.doc.length);
    } else {
      let normalize = undefined;
      if (!query.caseSensitive) {
        normalize = s => s.toLowerCase();
      }
      cursor = new SearchCursor(state.doc, query.searchText, 0, state.doc.length, normalize);
    }

    while (!cursor.next().done) {
      results.push({ from: cursor.value.from, to: cursor.value.to });
    }

    return results;
  }

  function scrollToMatch() {
    if (currentIndex < 0 || matches.length === 0) return;
    const match = matches[currentIndex];
    editorView.dispatch({
      selection: { anchor: match.from, head: match.to },
      scrollIntoView: true
    });
  }

  function updateCounter() {
    if (matches.length === 0 || currentIndex < 0) {
      counter.textContent = "0/0";
    } else {
      counter.textContent = `${currentIndex + 1}/${matches.length}`;
    }
  }

  function updateSearch(queryText) {
    matches = [];
    currentIndex = -1;

    if (!queryText) {
      editorView.dispatch({
        selection: { anchor: editorView.state.selection.main.head }
      });
      counter.textContent = "";
      return;
    }

    const query = createSearchQuery(queryText, caseSensitive);
    matches = collectMatches(editorView.state, query);

    if (matches.length > 0) {
      currentIndex = 0;
      scrollToMatch();
    }

    updateCounter();
  }

  function goToNextMatch() {
    if (!matches.length) return;
    currentIndex = (currentIndex + 1) % matches.length;
    scrollToMatch();
    updateCounter();
  }

  searchInput.addEventListener("input", e => updateSearch(e.target.value));
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      goToNextMatch();
    }
  });

  nextBtn.addEventListener("click", goToNextMatch);
  prevBtn.addEventListener("click", () => {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    scrollToMatch();
    updateCounter();
  });

  caseBtn.addEventListener("click", () => {
    caseSensitive = !caseSensitive;
    caseBtn.classList.toggle("active", caseSensitive);
    updateSearch(searchInput.value);
  });

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

export const commonExtensions = [
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  drawSelection(),
  bracketMatching(),
  closeBrackets(),
  highlightSelectionMatches(),
  EditorView.lineWrapping,
]

export {
  // Core
  EditorState,
  EditorSelection,
  EditorView,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  keymap,
  hoverTooltip,

  // Commands / history
  commands,

  // Language system
  bracketMatching,
  tags,

  // Linter
  linter,
  lintGutter,

  // Search
  highlightSelectionMatches,
  search,

  // Autocomplete / Brackets
  closeBrackets,
  closeBracketsKeymap,
  autocompletion,
  completionKeymap
};
