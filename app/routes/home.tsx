import { useLoaderData } from "react-router";
import { useContext } from "react";
import { AuthContext } from "~/context";
import { request } from "~/utils/requests";
import type { TTourSet } from "~/types";
import List from "~/components/List";

export const meta = () => {
  return [
    { title: "Open Tour Builder Admin" },
    { name: "description", content: "Welcome to Open Tour Builder Admin" },
  ];
};

export const clientLoader = async () => {
  // /:tenant/v4/admin/tour_sets
  const { data } = await request({ path: "public/v4/admin/tour_sets" });
  return { tourSets: data };
};

clientLoader.hydrate = true as const;

const HomeRoute = () => {
  const { tourSets } = useLoaderData<{ tourSets: TTourSet[] }>();
  const { signedIn } = useContext(AuthContext);

  if (!signedIn || !tourSets) return <></>;

  return <List items={tourSets} handleDelete={() => {}} heading="Tour Site" />;
};

export default HomeRoute;
