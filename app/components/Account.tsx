import { Button } from "@headlessui/react";
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router";
import { AuthContext } from "~/contexts";
import { signOut } from "~/utils/requests";
import SignIn from "./SignIn.client";

const Account = () => {
  const { signedIn, currentUser, setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handelSignOut = async () => {
    const { response } = await signOut();
    if (response.ok) {
      setCurrentUser(undefined);
      navigate("/signin");
    }
  };

  if (signedIn) {
    return (
      <>
        {currentUser && !currentUser.super && <SignIn />}
        {currentUser && (
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `hover:underline ${isActive ? "underline" : ""}`
            }
          >
            {currentUser.display_name || currentUser.email}
            <span className="sr-only">, your profile</span>
          </NavLink>
        )}
        <Button
          className="cursor-pointer capitalize border-black/45 text-black/75 border-2 rounded-md px-2 py-1"
          onClick={handelSignOut}
        >
          Sign Out
        </Button>
      </>
    );
  }
  return <></>;
};

export default Account;
