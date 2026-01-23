import type { TEmbedProvider } from "~/types";

interface EmbedParser {
  provider: TEmbedProvider;
  test: (url: string) => boolean;
  extract: (url: string) => string | null;
  buildEmbedUrl: (code: string) => string;
}

const embedParsers: EmbedParser[] = [
  {
    provider: "youtube",
    test: (url) =>
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/.test(
        url
      ),
    extract: (url) => {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/
      );
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//www.youtube.com/embed/${code}`,
  },
  {
    provider: "vimeo",
    test: (url) =>
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/)?(\d+)/.test(
        url
      ),
    extract: (url) => {
      const match = url.match(
        /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/)?(\d+)/
      );
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//player.vimeo.com/video/${code}`,
  },
  {
    provider: "vimeo",
    test: (url) => /player\.vimeo\.com\/video\/(\d+)/.test(url),
    extract: (url) => {
      const match = url.match(/player\.vimeo\.com\/video\/(\d+)/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//player.vimeo.com/video/${code}`,
  },
  {
    provider: "soundcloud",
    test: (url) => /<iframe.*?src="https:([^"]+)"/.test(url),
    extract: (url) => {
      const match = url.match(/<iframe.*?src="https:([^"]+)"/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => code, // SoundCloud uses full URL
  },
];

export const parseEmbedUrl = (
  url: string
): { provider: TEmbedProvider; embedUrl: string; embedCode: string } | null => {
  for (const parser of embedParsers) {
    if (parser.test(url)) {
      const code = parser.extract(url);
      if (code) {
        return {
          provider: parser.provider,
          embedUrl: parser.buildEmbedUrl(code),
          embedCode: code,
        };
      }
    }
  }
  return null;
};
