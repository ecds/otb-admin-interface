type PaginationLink = {
  url: string;
  page: string;
  per: string;
  [key: string]: string; // Allow additional query params
};

export type PaginationLinks = {
  prev?: PaginationLink;
  next?: PaginationLink;
  last?: PaginationLink;
  first?: PaginationLink;
};

export const parseLinkHeader = (header: string): PaginationLinks | null => {
  if (!header || header.length === 0) {
    return null;
  }

  const parts = header.split(",");
  const links: PaginationLinks = {};

  parts.forEach((p) => {
    const section = p.split(";");
    if (section.length !== 2) {
      throw new Error("section could not be split on ';'");
    }

    const urlMatch = section[0].match(/<(.*)>/);
    const url = urlMatch ? urlMatch[1].trim() : null;

    const relMatch = section[1].match(/rel="(.*)"/);
    const rel = relMatch ? relMatch[1].trim() : null;

    if (url && rel && isValidRel(rel)) {
      const urlObj = new URL(url);
      const link: Partial<PaginationLink> = { url };

      urlObj.searchParams.forEach((value, key) => {
        link[key] = value;
      });

      // Only assign if we have required fields
      if (link.page && link.per) {
        links[rel] = link as PaginationLink;
      }
    }
  });

  return links;
};

// Type guard to ensure rel is a valid key
function isValidRel(rel: string): rel is keyof PaginationLinks {
  return ["prev", "next", "last", "first"].includes(rel);
}
