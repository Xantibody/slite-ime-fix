// Slite Japanese IME Fix
// Auto-generated from src/ime-fix.js

(function() {
  'use strict';

// Slite Japanese IME Fix - Core Logic

function createIMEFix(getEditorFn) {
  let savedMarks = null;
  let isComposing = false;

  function handleCompositionStart() {
    const editor = getEditorFn();
    if (!editor) return;

    isComposing = true;
    savedMarks = editor.marks;
    editor.marks = null;
  }

  function handleCompositionEnd() {
    const editor = getEditorFn();
    if (!editor) return;

    isComposing = false;
    if (savedMarks !== null) {
      editor.marks = savedMarks;
      savedMarks = null;
    }
  }

  function getState() {
    return { savedMarks, isComposing };
  }

  return {
    handleCompositionStart,
    handleCompositionEnd,
    getState,
  };
}

function getEditorFromRefs(editorRefs) {
  if (!editorRefs || editorRefs.size === 0) {
    return null;
  }
  const refs = [...editorRefs];
  if (refs.length === 0) return null;

  const ref = refs[0].ref;
  if (!ref || typeof ref.deref !== 'function') return null;

  return ref.deref();
}

  // Initialize
  const getEditor = () => getEditorFromRefs(window.__EDITOR_REFS__);
  const imeFix = createIMEFix(getEditor);

  document.addEventListener('compositionstart', imeFix.handleCompositionStart, true);
  document.addEventListener('compositionend', imeFix.handleCompositionEnd, true);

  console.log('[Slite IME Fix] Loaded');
})();
