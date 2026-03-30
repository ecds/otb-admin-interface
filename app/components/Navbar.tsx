import { NavLink } from "react-router";
import Account from "./Account";
import { useContext } from "react";
import { AuthContext, TourSetContext } from "~/contexts";

const Navbar = () => {
  const tourSet = useContext(TourSetContext);
  const { currentUser } = useContext(AuthContext);
  return (
    <nav className="bg-gray-200 fixed top-0 w-screen px-6 h-12 flex justify-between items-center z-50 drop-shadow-md">
      <div className="flex flex-row space-x-6 items-center ml-6 text-black/80">
        <NavLink to="/">
          <img
            src="/admin/otblogo.png"
            className="h-12"
            alt="Open Tour Builder Branding"
          />
          <span className="sr-only">home</span>
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "underline" : "")}
        >
          Home
        </NavLink>
        <ul className="flex space-x-8 flex-row">
          {tourSet?.name && (
            <li>
              <NavLink
                to={`/${tourSet.subdir}`}
                className={({ isActive }) => (isActive ? "underline" : "")}
              >
                {tourSet.name}
              </NavLink>
            </li>
          )}
          {currentUser?.super && (
            <li>
              <NavLink to="/users" className="">
                Users
              </NavLink>
            </li>
          )}
          <li>
            <a
              href="https://github.com/ecds/OpenTourBuilder/wiki/How-to-Use-OpenTour-v.-3.0"
              className=""
            >
              Documentation
            </a>
          </li>
        </ul>
      </div>
      <div className="flex items-center space-x-12 pe-8">
        <Account />
      </div>
    </nav>
  );
};

export default Navbar;
