import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "react-router";

import "./app.css";
import { fetchCurrentUser, verifyToken } from "./utils/requests";
import type React from "react";
import type { ShouldRevalidateFunction } from "react-router";
import { useEffect, useState } from "react";
import { AuthContext, FeedbackContext } from "./contexts";
import Feedback from "./components/Feedback";
import type { Route } from "./+types/root";
import type { TUser } from "./types";
import Terms from "./components/Terms";
import { QueryProvider } from "./providers/QueryProvider";

export const links: Route.LinksFunction = () => [];

export const clientLoader = async () => {
  const session = await fetchCurrentUser();
  return { session };
};

clientLoader.hydrate = true as const;

// The session only matters on first load (sign-in/out update AuthContext
// directly), so query-string changes like sorting or filtering don't refetch it.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  const onlySearchChanged =
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search !== nextUrl.search;
  return onlySearchChanged ? false : defaultShouldRevalidate;
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/admin/favicon.ico" type="image/x-icon" />

        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { session } = useLoaderData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<TUser | undefined>(undefined);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<
    { type: "success" | "error"; message: string } | undefined
  >(undefined);
  const [currentTenantAdmin, setCurrentTenantAdmin] = useState<boolean>(false);

  useEffect(() => {
    if (!session) navigate("/signin");

    if (session?.id) {
      setCurrentUser(session);
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    setSignedIn(Boolean(currentUser) && currentUser.terms_accepted);
  }, [currentUser]);

  useEffect(() => {
    const verifyExchange = async (token: string) => {
      const verifyResponse = await verifyToken(token);
      if (verifyResponse) {
        if (window.opener) window.opener.postMessage(verifyResponse, "*");
        window.close();
      }
    };

    const token = searchParams.get("access_token");

    if (token) {
      verifyExchange(token);
    }
  }, [signedIn, navigate, searchParams]);

  return (
    <QueryProvider>
      <AuthContext.Provider
        value={{
          signedIn,
          currentUser,
          setCurrentUser,
          currentTenantAdmin,
          setCurrentTenantAdmin,
        }}
      >
        <Terms />
        <FeedbackContext.Provider value={{ feedback, setFeedback }}>
          <Feedback />
          <Outlet />
        </FeedbackContext.Provider>
      </AuthContext.Provider>
    </QueryProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
