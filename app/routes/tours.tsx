import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { request } from "~/utils/requests";
import List from "~/components/List";
import type { TTour } from "~/types";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: tours } = await request({
    path: `${params.tourSet}/v4/admin/tours`,
  });
  return { tours: tours };
};

clientLoader.hydrate = true as const;

const TourSetRoute = () => {
  const { tours } = useLoaderData<{
    tours: TTour[];
  }>();

  return (
    <div>
      <List items={tours} handleDelete={() => {}} heading="Tours" />
    </div>
  );
};

export default TourSetRoute;
