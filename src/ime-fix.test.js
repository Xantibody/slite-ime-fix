import { describe, it, expect, beforeEach, vi } from "vitest";
import { createIMEFix, getEditorFromRefs, cleanupMarkPlaceholders, ZWNBSP } from "./ime-fix.js";

describe("createIMEFix", () => {
  let mockEditor;
  let imeFix;

  beforeEach(() => {
    mockEditor = {
      marks: { bold: true, italic: true },
    };
    imeFix = createIMEFix(() => mockEditor);
  });

  describe("handleCompositionStart", () => {
    it("should save marks and set editor.marks to null", () => {
      const originalMarks = mockEditor.marks;

      imeFix.handleCompositionStart();

      expect(mockEditor.marks).toBe(null);
      expect(imeFix.getState().savedMarks).toEqual(originalMarks);
      expect(imeFix.getState().isComposing).toBe(true);
    });

    it("should do nothing if editor is null", () => {
      const nullEditorFix = createIMEFix(() => null);

      nullEditorFix.handleCompositionStart();

      expect(nullEditorFix.getState().isComposing).toBe(false);
      expect(nullEditorFix.getState().savedMarks).toBe(null);
    });
  });

  describe("handleCompositionEnd", () => {
    it("should restore saved marks", () => {
      const originalMarks = mockEditor.marks;

      imeFix.handleCompositionStart();
      expect(mockEditor.marks).toBe(null);

      imeFix.handleCompositionEnd();

      expect(mockEditor.marks).toEqual(originalMarks);
      expect(imeFix.getState().savedMarks).toBe(null);
      expect(imeFix.getState().isComposing).toBe(false);
    });

    it("should do nothing if no saved marks", () => {
      imeFix.handleCompositionEnd();

      expect(mockEditor.marks).toEqual({ bold: true, italic: true });
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
      expect(mockEditor.marks).toBe(null);
      imeFix.handleCompositionEnd();
      expect(mockEditor.marks).toEqual(originalMarks);

      // Second cycle with different marks
      mockEditor.marks = { italic: true };
      imeFix.handleCompositionStart();
      expect(mockEditor.marks).toBe(null);
      imeFix.handleCompositionEnd();
      expect(mockEditor.marks).toEqual({ italic: true });
    });
  });
});

describe("getEditorFromRefs", () => {
  it("should return null if editorRefs is null", () => {
    expect(getEditorFromRefs(null)).toBe(null);
  });

  it("should return null if editorRefs is empty", () => {
    const emptySet = new Set();
    expect(getEditorFromRefs(emptySet)).toBe(null);
  });

  it("should return null if ref.deref is not a function", () => {
    const refs = new Set([{ ref: {} }]);
    expect(getEditorFromRefs(refs)).toBe(null);
  });

  it("should return editor from WeakRef", () => {
    const mockEditor = { marks: {} };
    const refs = new Set([
      {
        ref: { deref: () => mockEditor },
      },
    ]);

    expect(getEditorFromRefs(refs)).toBe(mockEditor);
  });

  it("should return null if WeakRef is garbage collected", () => {
    const refs = new Set([
      {
        ref: { deref: () => undefined },
      },
    ]);

    expect(getEditorFromRefs(refs)).toBe(undefined);
  });
});

describe("cleanupMarkPlaceholders", () => {
  function mockDocument(placeholders) {
    global.document = {
      querySelectorAll: vi.fn(() => placeholders),
    };
  }

  it("should reset placeholder content to ZWNBSP if text remains", () => {
    const placeholder = { textContent: `${ZWNBSP}残ったテキスト` };
    mockDocument([placeholder]);

    cleanupMarkPlaceholders();

    expect(placeholder.textContent).toBe(ZWNBSP);
  });

  it("should not modify placeholder if content is already ZWNBSP", () => {
    const placeholder = { textContent: ZWNBSP };
    mockDocument([placeholder]);

    cleanupMarkPlaceholders();

    expect(placeholder.textContent).toBe(ZWNBSP);
  });

  it("should handle multiple placeholders", () => {
    const placeholder1 = { textContent: `${ZWNBSP}テスト1` };
    const placeholder2 = { textContent: ZWNBSP };
    const placeholder3 = { textContent: `${ZWNBSP}テスト2` };
    mockDocument([placeholder1, placeholder2, placeholder3]);

    cleanupMarkPlaceholders();

    expect(placeholder1.textContent).toBe(ZWNBSP);
    expect(placeholder2.textContent).toBe(ZWNBSP);
    expect(placeholder3.textContent).toBe(ZWNBSP);
  });

  it("should handle empty placeholder list", () => {
    mockDocument([]);

    expect(() => cleanupMarkPlaceholders()).not.toThrow();
  });

  it("should handle placeholder with empty textContent", () => {
    const placeholder = { textContent: "" };
    mockDocument([placeholder]);

    cleanupMarkPlaceholders();

    expect(placeholder.textContent).toBe("");
  });

  it("should handle placeholder with null textContent", () => {
    const placeholder = { textContent: null };
    mockDocument([placeholder]);

    cleanupMarkPlaceholders();

    expect(placeholder.textContent).toBe(null);
  });
});

describe("ZWNBSP constant", () => {
  it("should be the zero-width no-break space character", () => {
    expect(ZWNBSP).toBe("\uFEFF");
    expect(ZWNBSP.charCodeAt(0)).toBe(0xfeff);
  });
});
