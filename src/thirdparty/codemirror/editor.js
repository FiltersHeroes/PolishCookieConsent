// Core
import { EditorState, StateEffect, EditorSelection } from '@codemirror/state';
import { EditorView, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, keymap } from '@codemirror/view';

// Commands / history
import * as commands from "@codemirror/commands"

// Language system
import { bracketMatching, StreamLanguage, HighlightStyle, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { Tag } from '@lezer/highlight';
import { simpleMode } from '@codemirror/legacy-modes/mode/simple-mode';

// Linter
import { lintGutter, linter } from "@codemirror/lint";

// Search
import { highlightSelectionMatches, getSearchQuery, setSearchQuery, SearchCursor, RegExpCursor, SearchQuery, search, findPrevious, findNext } from '@codemirror/search';

// Autocomplete / Brackets
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";

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

export function createSimpleMode(states) {
  const { languageData = {}, ...pureStates } = states;

  const tokenNames = new Set();
  for (const stateName in pureStates) {
    const rules = pureStates[stateName];
    if (Array.isArray(rules)) {
      rules.forEach(r => {
        if (typeof r.token === "string") tokenNames.add(r.token);
      });
    }
  }

  const tokenTable = {};
  tokenNames.forEach(name => {
    tokenTable[name] = Tag.define();
  });

  const simpleModeDef = simpleMode({
    ...pureStates,
    languageData
  });
  simpleModeDef.tokenTable = tokenTable;

  const language = StreamLanguage.define(simpleModeDef);

  const highlighter = syntaxHighlighting(
    HighlightStyle.define(
      Array.from(tokenNames).map(name => ({
        tag: tokenTable[name],
        class: `cm-${name}`
      }))
    )
  );

  return new LanguageSupport(language, [highlighter]);
}

export function createEditor(config = {}) {
  var editorState = EditorState.create({
    doc: config.doc || "",
    extensions: [
      [...(config.extensions || [])]
    ]
  });

  var editorView = new EditorView({
    state: editorState,
    parent: config.parent,
    autofocus: config.autofocus !== false
  });
  return editorView;
}

export function initCustomSearch(editorView, searchInput, counter, nextBtn, prevBtn) {
  let matches = [];
  let currentIndex = -1;

  function createSearchQuery(text) {
    let isRegexp = false;
    let searchText = text;
    let caseSensitive = true;

    const regexMatch = text.match(/^\/(.+)\/([a-z]*)$/);
    if (regexMatch) {
      isRegexp = true;
      searchText = regexMatch[1];
      const flags = regexMatch[2] || "";
      caseSensitive = !flags.includes("i");
    }

    return { searchText, isRegexp, caseSensitive };
  }

  function collectMatches(state, query) {
    let results = [];
    if (!query.searchText) return results;

    let cursor;
    if (query.isRegexp) {
      const options = { ignoreCase: !query.caseSensitive };
      const from = 0;
      const to = state.doc.length;
      cursor = new cm6.RegExpCursor(state.doc, query.searchText, options, from, to);
    } else {
      const from = 0;
      const to = state.doc.length;
      cursor = new cm6.SearchCursor(state.doc, query.searchText, from, to);
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

    const query = createSearchQuery(queryText);
    matches = collectMatches(editorView.state, query);

    if (matches.length > 0) {
      currentIndex = 0;
      scrollToMatch();
    }

    updateCounter();
  }

  searchInput.addEventListener("input", e => updateSearch(e.target.value));

  nextBtn.addEventListener("click", () => {
    if (matches.length === 0) return;
    currentIndex = (currentIndex + 1) % matches.length;
    scrollToMatch();
    updateCounter();
  });

  prevBtn.addEventListener("click", () => {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    scrollToMatch();
    updateCounter();
  });
}

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

  // Commands / history
  commands,

  // Language system
  bracketMatching,

  // Linter
  linter,
  lintGutter,

  // Search
  highlightSelectionMatches,
  getSearchQuery,
  setSearchQuery,
  SearchCursor,
  RegExpCursor,
  SearchQuery,
  search,
  findPrevious,
  findNext,

  // Autocomplete / Brackets
  closeBrackets,
  closeBracketsKeymap
};
