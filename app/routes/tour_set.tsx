import {
  Outlet,
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router";
import { request } from "~/utils/requests";
import { AuthContext, TourSetContext } from "~/contexts";
import Navbar from "~/components/Navbar";
import { useContext, useEffect, useState } from "react";
import type { TAccessRequest, TTourSet } from "~/types";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { response, data: tourSet } = await request({
    path: `public/v4/admin/tour_sets/${params.tourSet}`,
  });

  if (response.ok && tourSet.null)
    return { tourSet: { tenant: params.tourSet } };
  if (tourSet.error) return { error: tourSet.error };

  const { data: accessRequests } = await request({
    path: `${params.tourSet}/v4/admin/access_requests`,
  });

  if (accessRequests.error) return { error: accessRequests.error };

  return { tourSet, accessRequests };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tourSet, accessRequests, error } = useLoaderData<{
    tourSet: TTourSet;
    error?: string;
    accessRequests: TAccessRequest[];
  }>();
  const { currentUser, setCurrentTenantAdmin } = useContext(AuthContext);
  const [accessRequestModalOpen, setAccessRequestModalOpen] =
    useState<boolean>(false);
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
      <TourSetContext.Provider
        value={{
          tourSet,
          accessRequests,
          accessRequestModalOpen,
          setAccessRequestModalOpen,
        }}
      >
        <Navbar />
        <Outlet />;
      </TourSetContext.Provider>
    );
  }

  return <></>;
};

export default TourSetRoute;
