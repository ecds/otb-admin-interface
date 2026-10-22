// Where to go after signing in, carried on the sign-in page's URL as
// ?return_to=. Paths are relative to the app (no /admin basename).

const PARAM = "return_to";

type Place = { pathname: string; search?: string; hash?: string };

// Only same-app paths: "/..." but not "//host" or "/\host", which browsers
// treat as other sites. The sign-in page itself is never a destination.
const isSafe = (path: string | null | undefined): path is string =>
  !!path &&
  path.startsWith("/") &&
  !path.startsWith("//") &&
  !path.startsWith("/\\") &&
  !/^\/signin(?:[/?#]|$)/.test(path);

// The sign-in page, remembering where the person was headed.
export const signInPath = ({ pathname, search = "", hash = "" }: Place) => {
  const target = `${pathname}${search}${hash}`;
  return isSafe(target) && target !== "/"
    ? `/signin?${PARAM}=${encodeURIComponent(target)}`
    : "/signin";
};

// Where to send someone who has just signed in.
export const returnToFrom = (search: string | URLSearchParams) => {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const target = params.get(PARAM);
  return isSafe(target) ? target : "/";
};
