import type { TEmbedProvider } from "~/types";

interface EmbedParser {
  provider: TEmbedProvider;
  test: (url: string) => boolean;
  extract: (url: string) => string | null;
  buildEmbedUrl: (code: string) => string;
}

const resolveUrl = (url: string): string => {
  const xhr = new XMLHttpRequest();
  xhr.open(
    "GET",
    `https://api.opentour.site/public/v4/admin/resolve_url?url=${encodeURIComponent(url)}`,
    false,
  );
  xhr.send();
  if (xhr.status === 200) {
    return JSON.parse(xhr.responseText).resolved_url;
  }
  return url;
};

const embedParsers: EmbedParser[] = [
  {
    provider: "youtube",
    test: (url) =>
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/.test(
        url,
      ),
    extract: (url) => {
      const match = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/,
      );
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//www.youtube.com/embed/${code}`,
  },
  {
    provider: "vimeo",
    test: (url) =>
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/)?(\d+)/.test(
        url,
      ),
    extract: (url) => {
      const match = url.match(
        /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/)?(\d+)/,
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
    test: (url) =>
      /<iframe[^>]*src="https:\/\/[^"]*soundcloud\.com[^"]*"/.test(url),
    extract: (url) => {
      const match = url.match(/<iframe.*?src="https:([^"]+)"/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => code, // SoundCloud uses full URL
  },
  {
    provider: "sketchfab",
    test: (url) => /sketchfab\.com\/models\/[a-f0-9]{32}\/embed/.test(url),
    extract: (url) => {
      const match = url.match(/sketchfab\.com\/models\/([a-f0-9]{32})\/embed/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//sketchfab.com/models/${code}/embed`,
  },
  {
    provider: "sketchfab",
    test: (url) =>
      /<iframe[^>]*src="https:\/\/[^"]*sketchfab\.com[^"]*"/.test(url),
    extract: (url) => {
      const match = url.match(
        /<iframe.*?src="https:\/\/sketchfab\.com\/models\/([a-f0-9]{32})\/embed"/,
      );
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//sketchfab.com/models/${code}/embed`,
  },
  {
    provider: "sketchfab",
    test: (url) => /skfb\.ly\/\.*/.test(url),
    extract: (url) => {
      const model_url = resolveUrl(url);
      const match = model_url.match(/([a-f0-9]{32})(?:[^a-f0-9]|$)/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//sketchfab.com/models/${code}/embed`,
  },
  {
    provider: "sketchfab",
    test: (url) => /sketchfab\.com\/3d-models\/.*/.test(url),
    extract: (url) => {
      const match = url.match(/([a-f0-9]{32})(?:[^a-f0-9]|$)/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => `//sketchfab.com/models/${code}/embed`,
  },
  {
    provider: "matterport",
    test: (url) => /matterport\.com/.test(url),
    extract: (urlString) => {
      const url = new URL(urlString);
      return url.searchParams.get("m");
    },
    buildEmbedUrl: (code) => `https://my.matterport.com/show/?m=${code}`,
  },
  {
    provider: "unknown",
    test: (url) => /<iframe.*?src="https:([^"]+)"/.test(url),
    extract: (url) => {
      const match = url.match(/<iframe.*?src="https:([^"]+)"/);
      return match?.[1] || null;
    },
    buildEmbedUrl: (code) => code,
  },
];

export const parseEmbedUrl = (
  url: string,
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
