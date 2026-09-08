import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faExternalLink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router";
import SignIn from "~/components/SignIn.client";
import { AuthContext } from "~/contexts";

const SignInRoute = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) navigate("/");
  }, [currentUser, navigate]);

  if (currentUser) return <></>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] items-center justify-center">
      <h1 className="text-5xl text-black/75">Open Tour Builder</h1>
      {}
      <SignIn className="m-16 text-white bg-blue-500 text-3xl p-8 rounded-lg">
        Sign In or Create Account
      </SignIn>
      <p>
        By signing in you agree to Emory Center for Digital Scholarship&apos;s{" "}
        <a
          className="text-blue-500 hover:text-blue-800 underline"
          href="https://libraries.emory.edu/about/policies/emory-libraries-privacy-policy"
          target="_blank"
          rel="noreferrer"
        >
          Terms of Service and Privacy Policy{" "}
          <FontAwesomeIcon icon={faExternalLink} className="text-xs" />
        </a>
        .
      </p>
    </div>
  );
};

export default SignInRoute;
