import { NavLink } from "react-router";
import Account from "./Account";
import { useContext } from "react";
import { AuthContext, TourSetContext } from "~/contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faExternalLink } from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { tourSet, accessRequests, setAccessRequestModalOpen } =
    useContext(TourSetContext);
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
              className="flex flex-row"
            >
              Documentation{" "}
              <FontAwesomeIcon
                className="fill-black/75 text-xs self-center ms-0.5"
                icon={faExternalLink}
              />
            </a>
          </li>
        </ul>
      </div>
      <div className="flex items-center space-x-12 pe-8">
        {accessRequests.length > 0 && (
          <div className="relative group inline">
            <button
              className="relative"
              onClick={() => setAccessRequestModalOpen(true)}
            >
              <FontAwesomeIcon icon={faBell} />
              <span className="sr-only">
                {accessRequests.length} Pending Access Requests
              </span>
              <div className="absolute inline-flex text-white text-[0.5rem] items-center justify-center w-4 h-4 font-bold bg-red-500 border-2 border-buffer rounded-full -top-1 -end-2">
                {accessRequests.length}
              </div>
            </button>
            <div
              role="tooltip"
              className="absolute right-full w-max transform -translate-y-1/2 top-1/2 mb-2 hidden group-hover:block bg-black/75 text-white rounded py-1 px-2 z-10 transition-opacity duration-1000 opacity-0 group-hover:opacity-100"
            >
              There are {accessRequests.length} Pending Access Requests
            </div>
          </div>
        )}
        <Account />
      </div>
    </nav>
  );
};

export default Navbar;
