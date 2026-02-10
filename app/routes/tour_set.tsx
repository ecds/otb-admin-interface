import { Outlet, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { request } from "~/utils/requests";
import type { TTourSet, TTour } from "~/types";
import { TourSetContext } from "~/contexts";
import Navbar from "~/components/Navbar";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: tourSet } = await request({
    path: `public/v4/admin/tour_sets/${params.tourSet}`,
  });
  return { tourSet };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tourSet } = useLoaderData<{
    tourSet: TTourSet;
    tours: TTour[];
  }>();

  return (
    <TourSetContext value={tourSet}>
      <Navbar />
      <Outlet />;
    </TourSetContext>
  );
};

export default TourSetRoute;
