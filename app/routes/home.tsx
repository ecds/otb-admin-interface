import { useLoaderData, useNavigate } from "react-router";
import { useContext, useEffect, useState } from "react";
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
  const { data } = await request({
    path: "public/v4/admin/tour_sets",
  });
  return { tourSets: data };
};

clientLoader.hydrate = true as const;

const HomeRoute = () => {
  const { tourSets } = useLoaderData<{
    tourSets: TTourSet[];
  }>();
  const { signedIn, currentUser } = useContext(AuthContext);
  const [filteredTourSets, setFilteredTourSets] = useState<
    TTourSet[] | undefined
  >(undefined);
  const [myTourSets, setMyTourSets] = useState<TTourSet[] | undefined>(
    undefined,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.super) return;
    setFilteredTourSets(
      tourSets.filter(
        (ts) =>
          !currentUser?.tour_sets.map((uts) => uts.subdir).includes(ts.subdir),
      ),
    );
    setMyTourSets(
      tourSets.filter((ts) => {
        return currentUser?.tour_sets
          .map((uts) => uts.subdir)
          .includes(ts.subdir);
      }),
    );
  }, [currentUser, tourSets]);

  useEffect(() => {
    if (
      currentUser &&
      !currentUser.super &&
      currentUser.tour_sets.length === 0 &&
      currentUser.tours.length === 0
    ) {
      navigate("/access-request");
    }
  }, [currentUser, navigate]);

  const handleCreate = async () => {};

  if (!signedIn || !currentUser) return <></>;

  if (
    currentUser &&
    currentUser.tour_sets.length === 0 &&
    currentUser.tours.length === 0
  ) {
    return (
      <>
        <Navbar />
        <div className="mt-24 w-3xl mx-auto text-black/75 flex flex-col space-y-4">
          <ul>
            <li>{currentUser.tour_sets.length}</li>
            <li>{currentUser.tours.length}</li>
          </ul>
          <p>
            You have not been added to any tour sites. Please contact an{" "}
            <a
              href="mailto:ecds@emory.edu"
              className="text-blue-500 hover:text-blue-800 underline"
            >
              administrator
            </a>
            .*
          </p>
          <p>
            *If you have had access to tour sites in the past, and should still
            have access, please check to make sure that you used the same GMail
            account that you have previously used. If you use another account,
            your tour sites will not show!
          </p>
        </div>
      </>
    );
  }

  if (currentUser.super) {
    return (
      <>
        <Navbar />
        <div className="my-24">
          <List items={tourSets} handleDelete={() => {}} heading="Tour Site">
            <button
              className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg mb-8"
              onClick={handleCreate}
            >
              <FontAwesomeIcon icon={faPlus} /> Create New
            </button>
          </List>
        </div>
      </>
    );
  }

  if (filteredTourSets && myTourSets) {
    return (
      <>
        <Navbar />
        <div className="my-24">
          {myTourSets.length > 0 && (
            <>
              <h2 className="mt-8 mb-4 text-xl w-5/6 mx-auto text-black/72">
                Tour Sites
              </h2>
              <List
                items={myTourSets.filter((ts) =>
                  currentUser.tour_sets
                    .map((uts) => uts.subdir)
                    .includes(ts.subdir),
                )}
                handleDelete={() => {}}
                heading="Site"
              ></List>
            </>
          )}
          {currentUser.tours && (
            <>
              <h2 className="mt-8 mb-4 text-xl w-5/6 mx-auto text-black/72">
                Tours
              </h2>
              {currentUser.tours.map((tourAuthor) => {
                return (
                  <List
                    key={tourAuthor.tour_set.subdir}
                    items={tourAuthor.tours}
                    heading={tourAuthor.tour_set.name}
                    tenant={tourAuthor.tour_set.subdir}
                  ></List>
                );
              })}
            </>
          )}
        </div>
      </>
    );
  }
};

export default HomeRoute;
