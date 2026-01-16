import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { fetchData } from "~/utils/fetchers";
import type { TTourSet, TTour } from "~/types";
import List from "~/components/List";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: tourSet } = await fetchData({
    path: `public/tour-sets?subdir=${params.tourSet}`,
  });
  const { data: tours } = await fetchData({ path: `${params.tourSet}/tours` });
  return { tourSet: tourSet.data[0], tours: tours.data };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tourSet, tours } = useLoaderData<{
    tourSet: TTourSet;
    tours: TTour[];
  }>();

  return (
    <div>
      <h1 className="text-2xl text-black/85">{tourSet.attributes.name}!</h1>
      <List items={tours} handleDelete={() => {}} heading="Tours" />
    </div>
  );
};

export default TourSetRoute;
