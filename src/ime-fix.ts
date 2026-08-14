// Slite Japanese IME Fix - Core Logic

/** Zero-width no-break space (used by Slate as placeholder content) */
export const ZWNBSP = "﻿";

/** The subset of the Slate editor instance this extension touches. */
export interface SlateEditor {
  marks: Record<string, unknown> | null;
}

export type EditorGetter = () => SlateEditor | null;

export interface IMEFixState {
  readonly savedMarks: Record<string, unknown> | null;
  readonly isComposing: boolean;
}

export interface IMEFix {
  handleCompositionStart: () => void;
  handleCompositionEnd: () => void;
  getState: () => IMEFixState;
}

export function createIMEFix(getEditorFn: EditorGetter): IMEFix {
  let savedMarks: Record<string, unknown> | null = null;
  let isComposing = false;

  function handleCompositionStart(): void {
    const editor = getEditorFn();
    if (!editor) {
      return;
    }

    isComposing = true;
    savedMarks = editor.marks;
    editor.marks = null;
  }

  function handleCompositionEnd(): void {
    const editor = getEditorFn();
    if (!editor) {
      return;
    }

    isComposing = false;
    if (savedMarks !== null) {
      editor.marks = savedMarks;
      savedMarks = null;
    }
  }

  function getState(): IMEFixState {
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
export function cleanupMarkPlaceholders(): void {
  const placeholders = document.querySelectorAll("[data-slate-mark-placeholder]");
  for (const placeholder of placeholders) {
    if (placeholder.textContent !== null && placeholder.textContent !== ZWNBSP) {
      placeholder.textContent = ZWNBSP;
    }
  }
}

/** A `WeakRef`-like holder, as used by Slate's internal editor registry. */
export interface EditorRefEntry {
  ref?: { deref?: () => SlateEditor | undefined } | undefined;
}

export function getEditorFromRefs(
  editorRefs: ReadonlySet<EditorRefEntry> | null | undefined,
): SlateEditor | null {
  if (!editorRefs || editorRefs.size === 0) {
    return null;
  }

  const [entry] = [...editorRefs];
  if (entry === undefined) {
    return null;
  }

  const { ref } = entry;
  if (!ref || typeof ref.deref !== "function") {
    return null;
  }

  return ref.deref() ?? null;
}
