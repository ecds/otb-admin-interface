import { useLoaderData } from "react-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "~/contexts";
import { request } from "~/utils/requests";
import TourSetList from "~/components/TourSetList";
import TourList from "~/components/TourList";
import Navbar from "~/components/Navbar";
import CreateTourSet from "~/components/CreateTourSet";
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

  if (!signedIn || !currentUser) return <></>;

  if (
    currentUser &&
    !currentUser.super &&
    currentUser.tour_sets.length === 0 &&
    currentUser.tours.length === 0
  ) {
    return (
      <>
        <Navbar />
        <div className="mt-24 w-3xl mx-auto text-black/75 flex flex-col space-y-4">
          <p>You have not been added to any tour sites.*</p>
          <p className="flex w-full items-center justify-center">
            <a
              href="/admin/access-request"
              className="bg-blue-500 hover:bg-blue-800 text-white px-2 py-1 rounded-md drop-shadow-2xl uppercase font-light tracking-wide"
            >
              Request access and see any pending requests
            </a>
          </p>
          <p>
            *If you have had access to tour sites in the past, and should still
            have access, please check to make sure that you used the same GMail
            account that you have previously used. Your are currently signed in
            as <strong className="text-black">{currentUser.email}</strong>. If
            you use another account, your tour sites will not show!
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
          <TourSetList items={tourSets} heading="Tour Site">
            <CreateTourSet />
          </TourSetList>
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
              <TourSetList
                items={myTourSets.filter((ts) =>
                  currentUser.tour_sets
                    .map((uts) => uts.subdir)
                    .includes(ts.subdir),
                )}
                heading="Site"
              />
            </>
          )}
          {currentUser.tours && (
            <>
              <h2 className="mt-8 mb-4 text-xl w-5/6 mx-auto text-black/72">
                Tours
              </h2>
              {currentUser.tours.map((tourAuthor) => {
                return (
                  <TourList
                    key={tourAuthor.tour_set.subdir}
                    tours={tourAuthor.tours}
                    heading={tourAuthor.tour_set.name}
                    tenant={tourAuthor.tour_set.subdir}
                  />
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
