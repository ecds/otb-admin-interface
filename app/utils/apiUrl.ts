// Base URL of the OpenTour API. Set VITE_API_URL at build time to point at
// another server, such as a local one.
export const API_URL: string =
  import.meta.env.VITE_API_URL || "https://api.opentour.site";
