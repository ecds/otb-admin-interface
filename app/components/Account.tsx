import { useContext } from "react";
import { AuthContext } from "~/context";
import { signOut } from "~/utils/requests";

const Account = () => {
  const { signedIn, setCurrentUser } = useContext(AuthContext);

  const handelSignOut = async () => {
    const { response } = await signOut();
    if (response.ok) setCurrentUser(undefined);
  };

  if (signedIn) {
    return (
      <button
        className="cursor-pointer capitalize border-black/45 text-black/75 border-2 rounded-md px-2 py-1"
        onClick={handelSignOut}
      >
        Sign Out
      </button>
    );
  }
  return (
    <a
      className="cursor-pointer capitalize bg-blue-500 p-2 rounded-md text-white border-2 border-black/75"
      href="https://auth.digitalscholarship.emory.edu/auth/google_oauth2?origin=https://lvh.me:4200/admin"
    >
      sign in
    </a>
  );
};

export default Account;
