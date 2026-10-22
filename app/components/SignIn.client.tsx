import { useContext, useRef } from "react";
import { AuthContext } from "~/contexts";
import { useNavigate } from "react-router";
import { returnToFrom } from "~/utils/returnTo";
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
  const navigate = useNavigate();

  const signInCallback = (user: MessageEvent) => {
    setCurrentUser(user.data);
    // The sign-in page's return_to, if this was opened from there.
    if (user.data.id)
      navigate(returnToFrom(window.location.search), { replace: true });
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
        `https://auth.ecds.io/login?origin=https://${import.meta.env.VITE_SIGN_IN_REDIRECT ?? "lvh.me:4200"}`,
        "signInWindow",
        `width=${width}, height=${height}, left=${left},top=${top}`,
      );
    } else {
      signInWindowRef.current.focus();
    }
  };
  return (
    <div className="flex">
      <button className={className} onClick={handleSignIn}>
        {children ?? "Sign In"}
      </button>
    </div>
  );
};

export default SignIn;
