// Paste this utility somewhere shared, e.g. ~/utils/a11y.ts
export const enforceA11yOnLinks = (html: string): string => {
  if (typeof window === "undefined" || !html) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  let mutated = false;

  doc
    .querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')
    .forEach((link) => {
      // Security: prevent tab-napping
      const rel = new Set(
        (link.getAttribute("rel") ?? "").split(" ").filter(Boolean),
      );
      if (!rel.has("noopener") || !rel.has("noreferrer")) {
        rel.add("noopener");
        rel.add("noreferrer");
        link.setAttribute("rel", [...rel].join(" "));
        mutated = true;
      }

      // WCAG 2.4.4: aria-label must include the link text + new-tab warning
      const currentLabel = link.getAttribute("aria-label");
      const linkText = link.textContent?.trim() ?? "";
      const expectedLabel = `${linkText} (opens in a new tab)`;
      if (!currentLabel || !currentLabel.includes("opens in a new tab")) {
        link.setAttribute("aria-label", expectedLabel);
        mutated = true;
      }
    });

  return mutated ? doc.body.innerHTML : html;
};

export const safeId = () => {
  return `el-${crypto.randomUUID()}`;
};
