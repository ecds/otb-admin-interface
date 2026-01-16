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

import type { Route } from "./+types/root";
import "./app.css";
import { fetchCurrentUser, verifyToken } from "./utils/fetchers";
import { AuthContext } from "./context";
import { useEffect, useState } from "react";
import type { TUser } from "./types";
import Navbar from "./components/Navbar";

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

  useEffect(() => {
    if (session.id) {
      setCurrentUser(session);
    }
  }, [session]);

  useEffect(() => {
    setSignedIn(Boolean(currentUser?.id));
  }, [currentUser]);

  useEffect(() => {
    const verifyExchange = async (token: string) => {
      const verifyResponse = await verifyToken(token);
      setCurrentUser(verifyResponse);
      navigate("/admin");
    };
    const token = searchParams.get("access_token");

    if (token) {
      verifyExchange(token);
    }
  }, [signedIn, navigate, searchParams]);

  // useEffect(() => {
  //   if (!currentUser) {
  //     navigate("/admin");
  //   }
  // }, [currentUser]);

  return (
    <AuthContext.Provider value={{ signedIn, currentUser, setCurrentUser }}>
      <Navbar />
      <Outlet />
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
