import { describe, it, expect } from "vitest";
import { generateChromeManifest, generateFirefoxManifest, BASE_MANIFEST } from "./manifest.js";

describe("BASE_MANIFEST", () => {
  it("should have required common fields", () => {
    expect(BASE_MANIFEST.manifest_version).toBe(3);
    expect(BASE_MANIFEST.name).toBe("Slite Japanese IME Fix");
    expect(BASE_MANIFEST.version).toBeDefined();
    expect(BASE_MANIFEST.host_permissions).toContain("https://*.slite.com/*");
  });

  it("should have icons configuration", () => {
    expect(BASE_MANIFEST.icons).toEqual({
      16: "icons/icon-16.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    });
  });

  it("should have content_scripts for slite.com", () => {
    expect(BASE_MANIFEST.content_scripts).toHaveLength(1);
    expect(BASE_MANIFEST.content_scripts[0].matches).toContain("https://*.slite.com/*");
  });
});

describe("generateChromeManifest", () => {
  it("should include declarativeContent permission", () => {
    const manifest = generateChromeManifest();
    expect(manifest.permissions).toContain("declarativeContent");
  });

  it("should include storage permission", () => {
    const manifest = generateChromeManifest();
    expect(manifest.permissions).toContain("storage");
  });

  it("should use service_worker for background", () => {
    const manifest = generateChromeManifest();
    expect(manifest.background).toEqual({
      service_worker: "background.js",
    });
  });

  it("should not have browser_specific_settings", () => {
    const manifest = generateChromeManifest();
    expect(manifest.browser_specific_settings).toBeUndefined();
  });

  it("should preserve base manifest fields", () => {
    const manifest = generateChromeManifest();
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.icons).toBeDefined();
    expect(manifest.content_scripts).toBeDefined();
  });
});

describe("generateFirefoxManifest", () => {
  it("should include tabs permission", () => {
    const manifest = generateFirefoxManifest();
    expect(manifest.permissions).toContain("tabs");
  });

  it("should include storage permission", () => {
    const manifest = generateFirefoxManifest();
    expect(manifest.permissions).toContain("storage");
  });

  it("should use scripts array for background", () => {
    const manifest = generateFirefoxManifest();
    expect(manifest.background).toEqual({
      scripts: ["background.js"],
    });
  });

  it("should have browser_specific_settings for gecko", () => {
    const manifest = generateFirefoxManifest();
    expect(manifest.browser_specific_settings).toBeDefined();
    expect(manifest.browser_specific_settings.gecko).toBeDefined();
    expect(manifest.browser_specific_settings.gecko.id).toBeDefined();
    expect(manifest.browser_specific_settings.gecko.strict_min_version).toBeDefined();
  });

  it("should preserve base manifest fields", () => {
    const manifest = generateFirefoxManifest();
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.icons).toBeDefined();
    expect(manifest.content_scripts).toBeDefined();
  });
});
