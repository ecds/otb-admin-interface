import { useContext, useRef } from "react";
import { AuthContext } from "~/context";
import type { ReactNode } from "react";

const SignIn = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const signInWindowRef = useRef<WindowProxy>(null);
  const { setCurrentUser } = useContext(AuthContext);

  const signInCallback = (user: MessageEvent) => {
    setCurrentUser(user.data);
    window.removeEventListener("message", signInCallback);
  };

  const handleSignIn = () => {
    window.addEventListener("message", signInCallback);
    if (!signInWindowRef.current || signInWindowRef.current.closed) {
      const width = 410;
      const height = 730;
      const left = screen.width / 2 - width / 2;
      const top = screen.height / 2 - height / 2;
      signInWindowRef.current = window.open(
        "https://auth.digitalscholarship.emory.edu/auth/google_oauth2?origin=https://lvh.me:4200/admin",
        "signInWindow",
        `width=${width}, height=${height}, left=${left},top=${top}`,
      );
    } else {
      signInWindowRef.current.focus();
    }
  };
  return (
    <button className={className} onClick={handleSignIn}>
      {children ?? "Sign In"}
    </button>
  );
};

export default SignIn;
