import { describe, it, expect } from "vitest";
import { shouldIntercept, mapToKey } from "./emacs-keybind.js";

describe("shouldIntercept", () => {
  it("should return false when disabled", () => {
    const event = { ctrlKey: true, key: "f" };
    expect(shouldIntercept(event, false)).toBe(false);
  });

  it("should return true for Ctrl+F when enabled", () => {
    const event = { ctrlKey: true, key: "f" };
    expect(shouldIntercept(event, true)).toBe(true);
  });

  it("should return true for Ctrl+B when enabled", () => {
    const event = { ctrlKey: true, key: "b" };
    expect(shouldIntercept(event, true)).toBe(true);
  });

  it("should return true for Ctrl+N when enabled", () => {
    const event = { ctrlKey: true, key: "n" };
    expect(shouldIntercept(event, true)).toBe(true);
  });

  it("should return true for Ctrl+P when enabled", () => {
    const event = { ctrlKey: true, key: "p" };
    expect(shouldIntercept(event, true)).toBe(true);
  });

  it("should return true for Ctrl+A when enabled", () => {
    const event = { ctrlKey: true, key: "a" };
    expect(shouldIntercept(event, true)).toBe(true);
  });

  it("should return true for Ctrl+E when enabled", () => {
    const event = { ctrlKey: true, key: "e" };
    expect(shouldIntercept(event, true)).toBe(true);
  });

  it("should return false for non-mapped keys", () => {
    const event = { ctrlKey: true, key: "x" };
    expect(shouldIntercept(event, true)).toBe(false);
  });

  it("should return false without Ctrl key", () => {
    const event = { ctrlKey: false, key: "f" };
    expect(shouldIntercept(event, true)).toBe(false);
  });

  it("should return false when Alt is also pressed", () => {
    const event = { ctrlKey: true, altKey: true, key: "f" };
    expect(shouldIntercept(event, true)).toBe(false);
  });

  it("should return false when Meta is also pressed", () => {
    const event = { ctrlKey: true, metaKey: true, key: "f" };
    expect(shouldIntercept(event, true)).toBe(false);
  });
});

describe("mapToKey", () => {
  it("should map Ctrl+F to ArrowRight", () => {
    expect(mapToKey("f")).toBe("ArrowRight");
  });

  it("should map Ctrl+B to ArrowLeft", () => {
    expect(mapToKey("b")).toBe("ArrowLeft");
  });

  it("should map Ctrl+N to ArrowDown", () => {
    expect(mapToKey("n")).toBe("ArrowDown");
  });

  it("should map Ctrl+P to ArrowUp", () => {
    expect(mapToKey("p")).toBe("ArrowUp");
  });

  it("should map Ctrl+A to Home", () => {
    expect(mapToKey("a")).toBe("Home");
  });

  it("should map Ctrl+E to End", () => {
    expect(mapToKey("e")).toBe("End");
  });

  it("should return null for unmapped keys", () => {
    expect(mapToKey("x")).toBe(null);
  });
});
