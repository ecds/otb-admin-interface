import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { request } from "~/utils/requests";
import type { TTourSet, TTour } from "~/types";
import List from "~/components/List";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: tourSet } = await request({
    path: `public/v4/admin/tour_sets/${params.tourSet}`,
  });
  const { data: tours } = await request({
    path: `${params.tourSet}/v4/admin/tours`,
  });
  return { tourSet: tourSet, tours: tours };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tourSet, tours } = useLoaderData<{
    tourSet: TTourSet;
    tours: TTour[];
  }>();

  return (
    <div>
      <h1 className="text-2xl text-black/85">{tourSet.name}!</h1>
      <List items={tours} handleDelete={() => {}} heading="Tours" />
    </div>
  );
};

export default TourSetRoute;
