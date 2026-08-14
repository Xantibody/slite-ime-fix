import { describe, expect, it } from "vitest";
import { BASE_MANIFEST, generateChromeManifest, generateFirefoxManifest } from "./manifest.ts";

describe("the shared manifest base", () => {
  it("should have required common fields", () => {
    expect(BASE_MANIFEST.manifest_version).toBe(3);
    expect(BASE_MANIFEST.name).toBe("Slite Japanese IME Fix");
    expect(BASE_MANIFEST.version).toBeDefined();
    expect(BASE_MANIFEST.host_permissions).toContain("https://*.slite.com/*");
  });

  it("should have icons configuration", () => {
    expect(BASE_MANIFEST.icons).toStrictEqual({
      16: "icons/icon-16.png",
      48: "icons/icon-48.png",
      128: "icons/icon-128.png",
    });
  });

  it("should have content_scripts for slite.com", () => {
    expect(BASE_MANIFEST.content_scripts).toHaveLength(1);
    expect(BASE_MANIFEST.content_scripts[0]?.matches).toContain("https://*.slite.com/*");
  });

  it("should expose inject.js as a web accessible resource", () => {
    expect(BASE_MANIFEST.web_accessible_resources[0]?.resources).toContain("inject.js");
  });
});

describe(generateChromeManifest, () => {
  it("should include declarativeContent permission", () => {
    expect(generateChromeManifest().permissions).toContain("declarativeContent");
  });

  it("should include storage permission", () => {
    expect(generateChromeManifest().permissions).toContain("storage");
  });

  it("should use service_worker for background", () => {
    expect(generateChromeManifest().background).toStrictEqual({ service_worker: "background.js" });
  });

  it("should not have browser_specific_settings", () => {
    const manifest: Record<string, unknown> = { ...generateChromeManifest() };
    expect(manifest["browser_specific_settings"]).toBeUndefined();
  });

  it("should preserve base manifest fields", () => {
    const manifest = generateChromeManifest();
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.icons).toBeDefined();
    expect(manifest.content_scripts).toBeDefined();
  });
});

describe(generateFirefoxManifest, () => {
  it("should include tabs permission", () => {
    expect(generateFirefoxManifest().permissions).toContain("tabs");
  });

  it("should include storage permission", () => {
    expect(generateFirefoxManifest().permissions).toContain("storage");
  });

  it("should use scripts array for background", () => {
    expect(generateFirefoxManifest().background).toStrictEqual({ scripts: ["background.js"] });
  });

  it("should have browser_specific_settings for gecko", () => {
    const { gecko } = generateFirefoxManifest().browser_specific_settings;
    expect(gecko.id).toBeDefined();
    expect(gecko.strict_min_version).toBeDefined();
  });

  it("should preserve base manifest fields", () => {
    const manifest = generateFirefoxManifest();
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.icons).toBeDefined();
    expect(manifest.content_scripts).toBeDefined();
  });
});
