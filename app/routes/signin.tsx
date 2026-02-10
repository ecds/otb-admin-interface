import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SignIn from "~/components/SignIn.client";

const SignInRoute = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] items-center justify-center">
      <h1 className="text-5xl text-black/75">Open Tour Builder</h1>
      <SignIn className="m-16 text-white bg-red-500 text-3xl p-8 rounded-lg">
        <FontAwesomeIcon icon={faGoogle} /> Sign In with Google
      </SignIn>
    </div>
  );
};

export default SignInRoute;
