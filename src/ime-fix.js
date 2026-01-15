// Slite Japanese IME Fix - Core Logic

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
