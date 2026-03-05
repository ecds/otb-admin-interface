import { useLoaderData } from "react-router";
import { useContext } from "react";
import { AuthContext } from "~/contexts";
import { request } from "~/utils/requests";
import List from "~/components/List";
import Navbar from "~/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import type { TTourSet } from "~/types";

export const meta = () => {
  return [
    { title: "Open Tour Builder Admin" },
    { name: "description", content: "Welcome to Open Tour Builder Admin" },
  ];
};

export const clientLoader = async () => {
  const { data } = await request({ path: "public/v4/admin/tour_sets" });
  return { tourSets: data };
};

clientLoader.hydrate = true as const;

const HomeRoute = () => {
  const { tourSets } = useLoaderData<{ tourSets: TTourSet[] }>();
  const { signedIn, currentUser } = useContext(AuthContext);

  const handleCreate = async () => {};

  if (!signedIn || !currentUser || !tourSets) return <></>;

  return (
    <>
      <Navbar />
      {currentUser.super && (
        <button
          className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg"
          onClick={handleCreate}
        >
          <FontAwesomeIcon icon={faPlus} /> Create New
        </button>
      )}
      <div className="mt-24">
        <List items={tourSets} handleDelete={() => {}} heading="Tour Site" />
      </div>
    </>
  );
};

export default HomeRoute;
