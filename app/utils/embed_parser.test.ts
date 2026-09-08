import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseEmbedUrl } from "./embed_parser";

// resolveUrl makes a synchronous XHR; stub the constructor so it returns a
// controllable instance. vi.fn() alone isn't newable, so we use a class.
const mockXhr = {
  open: vi.fn(),
  send: vi.fn(),
  status: 200,
  responseText: "",
};
class MockXHR {
  open = mockXhr.open;
  send = mockXhr.send;
  get status() { return mockXhr.status; }
  get responseText() { return mockXhr.responseText; }
}
vi.stubGlobal("XMLHttpRequest", MockXHR);

beforeEach(() => vi.clearAllMocks());

describe("parseEmbedUrl", () => {
  it("returns null for an unrecognised URL", () => {
    expect(parseEmbedUrl("https://example.com/nothing")).toBeNull();
  });

  describe("YouTube", () => {
    it("parses watch URL", () => {
      const result = parseEmbedUrl("https://www.youtube.com/watch?v=F9ULbmCvmxY");
      expect(result).toEqual({
        provider: "youtube",
        embedCode: "F9ULbmCvmxY",
        embedUrl: "//www.youtube.com/embed/F9ULbmCvmxY",
      });
    });

    it("parses youtu.be short URL", () => {
      const result = parseEmbedUrl("https://youtu.be/F9ULbmCvmxY");
      expect(result?.provider).toBe("youtube");
      expect(result?.embedCode).toBe("F9ULbmCvmxY");
    });

    it("parses embed URL", () => {
      const result = parseEmbedUrl("https://www.youtube.com/embed/F9ULbmCvmxY");
      expect(result?.provider).toBe("youtube");
      expect(result?.embedCode).toBe("F9ULbmCvmxY");
    });
  });

  describe("Vimeo", () => {
    it("parses vimeo.com/VIDEO_ID", () => {
      const result = parseEmbedUrl("https://vimeo.com/123456789");
      expect(result).toEqual({
        provider: "vimeo",
        embedCode: "123456789",
        embedUrl: "//player.vimeo.com/video/123456789",
      });
    });

    it("parses player.vimeo.com/video/ID", () => {
      const result = parseEmbedUrl("https://player.vimeo.com/video/123456789");
      expect(result?.provider).toBe("vimeo");
      expect(result?.embedCode).toBe("123456789");
    });
  });

  describe("SoundCloud", () => {
    it("parses iframe with plain numeric track id", () => {
      const iframe = `<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/457871163&color=%23ff5500"></iframe>`;
      const result = parseEmbedUrl(iframe);
      expect(result?.provider).toBe("soundcloud");
      expect(result?.embedCode).toBe("457871163");
    });

    it("parses iframe with double-encoded compound track id", () => {
      const iframe = `<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A431162766&color=%23ff5500"></iframe>`;
      const result = parseEmbedUrl(iframe);
      expect(result?.provider).toBe("soundcloud");
      expect(result?.embedCode).toBe("431162766");
    });

    it("builds the correct embed URL from a track id", () => {
      const iframe = `<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/457871163"></iframe>`;
      const result = parseEmbedUrl(iframe);
      expect(result?.embedUrl).toContain("api.soundcloud.com/tracks/457871163");
    });
  });

  describe("Sketchfab", () => {
    const uuid = "4b570878a3cc4ca786af824a03ada414";

    it("parses a sketchfab.com model URL", () => {
      const result = parseEmbedUrl(`https://sketchfab.com/models/${uuid}`);
      expect(result).toEqual({
        provider: "sketchfab",
        embedCode: uuid,
        embedUrl: `//sketchfab.com/models/${uuid}/embed`,
      });
    });

    it("parses a sketchfab embed iframe", () => {
      const iframe = `<iframe src="https://sketchfab.com/models/${uuid}/embed"></iframe>`;
      const result = parseEmbedUrl(iframe);
      expect(result?.provider).toBe("sketchfab");
      expect(result?.embedCode).toBe(uuid);
    });

    it("resolves a skfb.ly short URL via XHR and extracts the uuid", () => {
      mockXhr.responseText = JSON.stringify({
        resolved_url: `https://sketchfab.com/models/${uuid}`,
      });
      const result = parseEmbedUrl("https://skfb.ly/owuDQ");
      expect(mockXhr.open).toHaveBeenCalled();
      expect(result?.provider).toBe("sketchfab");
      expect(result?.embedCode).toBe(uuid);
    });
  });

  describe("Matterport", () => {
    it("parses a matterport show URL", () => {
      const result = parseEmbedUrl("https://my.matterport.com/show/?m=SxQL3iGyvwk");
      expect(result).toEqual({
        provider: "matterport",
        embedCode: "SxQL3iGyvwk",
        embedUrl: "//my.matterport.com/show/?m=SxQL3iGyvwk",
      });
    });
  });

  describe("MorphoSource", () => {
    const uuid = "000390993";
    it("parses a morphosource manifest URL", () => {
      const result = parseEmbedUrl(
        `https://www.morphosource.org/manifests/${uuid}.json`,
      );
      expect(result?.provider).toBe("morphosource");
      expect(result?.embedCode).toBe(uuid);
      expect(result?.embedUrl).toContain(`/manifests/${uuid}`);
    });
  });

  describe("unknown (generic iframe)", () => {
    it("extracts the src from an unrecognised iframe", () => {
      const iframe = `<iframe src="https://3d-api.si.edu/voyager/3d_package:a1651b35"></iframe>`;
      const result = parseEmbedUrl(iframe);
      expect(result?.provider).toBe("unknown");
      expect(result?.embedCode).toBe("//3d-api.si.edu/voyager/3d_package:a1651b35");
    });
  });
});
