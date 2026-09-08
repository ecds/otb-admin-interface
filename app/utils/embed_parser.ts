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
    extract: (url) =>
      url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]+)/,
      )?.[1] ?? null,
    buildEmbedUrl: (code) => `//www.youtube.com/embed/${code}`,
  },
  {
    provider: "vimeo",
    // Matches vimeo.com/... and player.vimeo.com/video/... in one pattern
    test: (url) =>
      /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/)?|player\.vimeo\.com\/video\/)(\d+)/.test(
        url,
      ),
    extract: (url) =>
      url.match(
        /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^/]*\/videos\/|album\/\d+\/video\/|video\/)?|player\.vimeo\.com\/video\/)(\d+)/,
      )?.[1] ?? null,
    buildEmbedUrl: (code) => `//player.vimeo.com/video/${code}`,
  },
  {
    provider: "soundcloud",
    test: (url) =>
      /<iframe[^>]*src="https:\/\/[^"]*soundcloud\.com[^"]*"/.test(url),
    extract: (url) => {
      const tracksPart = url.match(
        /api\.soundcloud\.com\/tracks\/([^"&\s]+)/,
      )?.[1];
      return tracksPart?.match(/(\d+)$/)?.[1] ?? null;
    },
    buildEmbedUrl: (code) =>
      `//w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${code}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=true&sharing=false`,
  },
  {
    provider: "sketchfab",
    test: (url) =>
      /skfb\.ly\//.test(url) ||
      /sketchfab\.com/.test(url) ||
      /<iframe[^>]*src="https:\/\/[^"]*sketchfab\.com[^"]*"/.test(url),
    extract: (url) => {
      const resolved = /skfb\.ly\//.test(url) ? resolveUrl(url) : url;
      return resolved.match(/([a-f0-9]{32})(?:[^a-f0-9]|$)/)?.[1] ?? null;
    },
    buildEmbedUrl: (code) => `//sketchfab.com/models/${code}/embed`,
  },
  {
    provider: "matterport",
    test: (url) => /matterport\.com/.test(url),
    extract: (urlString) => new URL(urlString).searchParams.get("m"),
    buildEmbedUrl: (code) => `//my.matterport.com/show/?m=${code}`,
  },
  {
    provider: "morphosource",
    test: (url) => /morphosource\.org/.test(url),
    extract: (url) => url.match(/\/manifests\/([\w-]+)/)?.[1] ?? null,
    buildEmbedUrl: (code) =>
      `//www.morphosource.org/uv.html#?manifest=/manifests/${code}`,
  },
  {
    provider: "unknown",
    test: (url) => /<iframe.*?src="https:([^"]+)"/.test(url),
    extract: (url) => url.match(/<iframe.*?src="https:([^"]+)"/)?.[1] ?? null,
    buildEmbedUrl: (code) => code ?? "unknown",
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
