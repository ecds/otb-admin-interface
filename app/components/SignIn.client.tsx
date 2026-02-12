import { useContext, useRef } from "react";
import { AuthContext } from "~/contexts";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";

const SignIn = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const signInWindowRef = useRef<WindowProxy>(null);
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const redirect = import.meta.env.PROD
    ? import.meta.env.VITE_SIGN_IN_REDIRECT
    : "lvh.me:4200";

  const signInCallback = (user: MessageEvent) => {
    setCurrentUser(user.data);
    if (user.data.id) navigate("/admin");
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
        `https://auth.digitalscholarship.emory.edu/auth/google_oauth2?origin=https://${redirect}/admin`,
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
