type TErrorResponse = {
  error?: string;
  errors?: (string | { detail?: string })[];
};

/**
 * Server (and client-side validation) errors show up in a few different
 * shapes depending on the endpoint: `{ errors: [{ detail }] }` (validation
 * failures via Rails' serialize_errors), `{ errors: ["message", ...] }`
 * (plain-string array, e.g. public 404s), and `{ error: "message" }`
 * (singular — auth/not-found responses, and image_upload.ts's client-side
 * file-type check). Falls back to `fallback` if none of those are present,
 * e.g. a network failure with no response body at all.
 */
export const getErrorMessage = (
  data: TErrorResponse | undefined,
  fallback: string,
): string => {
  if (data?.errors && data.errors.length > 0) {
    const messages = data.errors
      .map((error) => (typeof error === "string" ? error : error.detail))
      .filter((message): message is string => Boolean(message));
    if (messages.length > 0) return messages.join(" ");
  }

  return data?.error ?? fallback;
};
