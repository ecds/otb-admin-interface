import { redirect } from "react-router";

// Requesting access is part of the profile page now; this keeps old links
// working.
export const clientLoader = () => redirect("/profile#request-access");

const AccessRequestRoute = () => null;

export default AccessRequestRoute;
