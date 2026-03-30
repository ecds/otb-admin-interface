import {
  Outlet,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import { request } from "~/utils/requests";
import { AuthContext, TourSetContext } from "~/contexts";
import Navbar from "~/components/Navbar";
import { useContext, useEffect } from "react";
import type { TTourSet } from "~/types";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { response, data } = await request({
    path: `public/v4/admin/tour_sets/${params.tourSet}`,
  });
  if (response.ok && data.null) return { tourSet: { tenant: params.tourSet } };
  if (data.error) return { error: data.error };

  return { tourSet: data };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tourSet, error } = useLoaderData<{
    tourSet: TTourSet;
    error?: string;
  }>();
  const { currentUser, setCurrentTenantAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (error === "unauthorized") navigate("/");
  }, [error, navigate]);

  useEffect(() => {
    if (
      tourSet &&
      currentUser?.tour_sets.map((uts) => uts.subdir).includes(tourSet.subdir)
    )
      setCurrentTenantAdmin(true);
  }, [currentUser, setCurrentTenantAdmin, tourSet]);

  if (tourSet) {
    return (
      <TourSetContext.Provider value={tourSet}>
        <Navbar />
        <Outlet />;
      </TourSetContext.Provider>
    );
  }

  return <></>;
};

export default TourSetRoute;
