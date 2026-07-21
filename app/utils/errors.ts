type TErrorResponse = {
  errors?: { detail?: string }[];
};

/** Server errors come back as `{ errors: [{ detail }] }` — pull out a readable string instead of rendering the raw response body. */
export const getErrorMessage = (
  data: TErrorResponse | undefined,
  fallback: string,
): string => data?.errors?.[0]?.detail ?? fallback;
