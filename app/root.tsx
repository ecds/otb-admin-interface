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
import { AuthContext } from "./context";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { FeedbackContext } from "./contexts";
import Feedback from "./components/Feedback";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import SignIn from "./components/SignIn.client";
import type { Route } from "./+types/root";
import type { TUser } from "./types";

export const links: Route.LinksFunction = () => [];

export const clientLoader = async () => {
  const session = await fetchCurrentUser();
  return { session };
};

clientLoader.hydrate = true as const;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

  useEffect(() => {
    if (session?.id) {
      setCurrentUser(session);
    }
  }, [session]);

  useEffect(() => {
    setSignedIn(Boolean(currentUser?.id));
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
    <AuthContext.Provider value={{ signedIn, currentUser, setCurrentUser }}>
      <FeedbackContext.Provider value={{ feedback, setFeedback }}>
        <Feedback />
        <Navbar />
        {currentUser ? (
          <Outlet />
        ) : (
          <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
            {searchParams.get("access_token") ? (
              <div>Signing In...</div>
            ) : (
              <SignIn className="m-16 text-white bg-red-500 text-3xl p-8 rounded-lg">
                <FontAwesomeIcon icon={faGoogle} /> Sign In with Google
              </SignIn>
            )}
          </div>
        )}
      </FeedbackContext.Provider>
    </AuthContext.Provider>
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
