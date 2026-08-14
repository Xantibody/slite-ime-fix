import { beforeEach, describe, expect, it } from "vitest";
import { cleanupMarkPlaceholders, createIMEFix, getEditorFromRefs, ZWNBSP } from "./ime-fix.ts";
import type { EditorRefEntry, IMEFix, SlateEditor } from "./ime-fix.ts";

describe(createIMEFix, () => {
  let mockEditor: SlateEditor;
  let imeFix: IMEFix;

  beforeEach(() => {
    mockEditor = { marks: { bold: true, italic: true } };
    imeFix = createIMEFix(() => mockEditor);
  });

  describe("handleCompositionStart", () => {
    it("should save marks and set editor.marks to null", () => {
      const originalMarks = mockEditor.marks;

      imeFix.handleCompositionStart();

      expect(mockEditor.marks).toBeNull();
      expect(imeFix.getState().savedMarks).toStrictEqual(originalMarks);
      expect(imeFix.getState().isComposing).toBe(true);
    });

    it("should do nothing if editor is null", () => {
      const nullEditorFix = createIMEFix(() => null);

      nullEditorFix.handleCompositionStart();

      expect(nullEditorFix.getState().isComposing).toBe(false);
      expect(nullEditorFix.getState().savedMarks).toBeNull();
    });
  });

  describe("handleCompositionEnd", () => {
    it("should restore saved marks", () => {
      const originalMarks = mockEditor.marks;

      imeFix.handleCompositionStart();
      expect(mockEditor.marks).toBeNull();

      imeFix.handleCompositionEnd();

      expect(mockEditor.marks).toStrictEqual(originalMarks);
      expect(imeFix.getState().savedMarks).toBeNull();
      expect(imeFix.getState().isComposing).toBe(false);
    });

    it("should do nothing if no saved marks", () => {
      imeFix.handleCompositionEnd();

      expect(mockEditor.marks).toStrictEqual({ bold: true, italic: true });
    });

    it("should do nothing if editor is null", () => {
      const nullEditorFix = createIMEFix(() => null);

      nullEditorFix.handleCompositionEnd();

      expect(nullEditorFix.getState().isComposing).toBe(false);
    });
  });

  describe("full IME composition cycle", () => {
    it("should handle multiple composition cycles", () => {
      const originalMarks = { bold: true };
      mockEditor.marks = originalMarks;

      // First cycle
      imeFix.handleCompositionStart();
      expect(mockEditor.marks).toBeNull();
      imeFix.handleCompositionEnd();
      expect(mockEditor.marks).toStrictEqual(originalMarks);

      // Second cycle with different marks
      mockEditor.marks = { italic: true };
      imeFix.handleCompositionStart();
      expect(mockEditor.marks).toBeNull();
      imeFix.handleCompositionEnd();
      expect(mockEditor.marks).toStrictEqual({ italic: true });
    });
  });
});

describe(getEditorFromRefs, () => {
  it("should return null if editorRefs is null", () => {
    expect(getEditorFromRefs(null)).toBeNull();
  });

  it("should return null if editorRefs is empty", () => {
    expect(getEditorFromRefs(new Set<EditorRefEntry>())).toBeNull();
  });

  it("should return null if ref.deref is not a function", () => {
    expect(getEditorFromRefs(new Set([{ ref: {} }]))).toBeNull();
  });

  it("should return editor from WeakRef", () => {
    const mockEditor: SlateEditor = { marks: {} };
    const refs = new Set([{ ref: { deref: (): SlateEditor => mockEditor } }]);

    expect(getEditorFromRefs(refs)).toBe(mockEditor);
  });

  it("should return null if WeakRef is garbage collected", () => {
    const refs = new Set([{ ref: { deref: (): undefined => undefined } }]);

    expect(getEditorFromRefs(refs)).toBeNull();
  });
});

function addPlaceholder(text: string): HTMLElement {
  const placeholder = document.createElement("span");
  placeholder.dataset["slateMarkPlaceholder"] = "true";
  placeholder.textContent = text;
  document.body.append(placeholder);

  return placeholder;
}

describe(cleanupMarkPlaceholders, () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("should reset placeholder content to ZWNBSP if text remains", () => {
    const placeholder = addPlaceholder(`${ZWNBSP}残ったテキスト`);

    cleanupMarkPlaceholders();

    expect(placeholder.textContent).toBe(ZWNBSP);
  });

  it("should not modify placeholder if content is already ZWNBSP", () => {
    const placeholder = addPlaceholder(ZWNBSP);

    cleanupMarkPlaceholders();

    expect(placeholder.textContent).toBe(ZWNBSP);
  });

  it("should handle multiple placeholders", () => {
    const first = addPlaceholder(`${ZWNBSP}テスト1`);
    const second = addPlaceholder(ZWNBSP);
    const third = addPlaceholder(`${ZWNBSP}テスト2`);

    cleanupMarkPlaceholders();

    expect(first.textContent).toBe(ZWNBSP);
    expect(second.textContent).toBe(ZWNBSP);
    expect(third.textContent).toBe(ZWNBSP);
  });

  it("should handle empty placeholder list", () => {
    expect(() => {
      cleanupMarkPlaceholders();
    }).not.toThrow();
  });

  it("should leave non-placeholder elements untouched", () => {
    const editorText = document.createElement("span");
    editorText.dataset["slateString"] = "true";
    editorText.textContent = "大変だ体現";
    document.body.append(editorText);

    cleanupMarkPlaceholders();

    expect(editorText.textContent).toBe("大変だ体現");
  });
});

describe("the zero-width placeholder character", () => {
  it("should be the zero-width no-break space character", () => {
    expect(ZWNBSP).toBe("﻿");
    expect(ZWNBSP.codePointAt(0)).toBe(0xfe_ff);
  });
});
