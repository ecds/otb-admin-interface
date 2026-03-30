import { Button } from "@headlessui/react";
import { useContext } from "react";
import { NavLink, useNavigate } from "react-router";
import { AuthContext } from "~/contexts";
import { signOut } from "~/utils/requests";

const Account = () => {
  const { signedIn, setCurrentUser } = useContext(AuthContext);
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
        <NavLink
          to="/access-request"
          className={({ isActive }) => (isActive ? "underline" : "")}
        >
          Request Access
        </NavLink>
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
