// Slite Japanese IME Fix - Core Logic

// Zero-width no-break space (used by Slate as placeholder content)
export const ZWNBSP = "\uFEFF";

export function createIMEFix(getEditorFn) {
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

/**
 * Clean up mark-placeholder elements after composition ends.
 *
 * Slate.js sometimes leaves committed text in mark-placeholder elements,
 * causing duplicate text display. This function resets placeholder content
 * to just the zero-width character.
 */
export function cleanupMarkPlaceholders() {
  const placeholders = document.querySelectorAll("[data-slate-mark-placeholder]");
  placeholders.forEach((p) => {
    if (p.textContent && p.textContent !== ZWNBSP) {
      p.textContent = ZWNBSP;
    }
  });
}

export function getEditorFromRefs(editorRefs) {
  if (!editorRefs || editorRefs.size === 0) {
    return null;
  }
  const refs = [...editorRefs];
  if (refs.length === 0) return null;

  const ref = refs[0].ref;
  if (!ref || typeof ref.deref !== "function") return null;

  return ref.deref();
}
