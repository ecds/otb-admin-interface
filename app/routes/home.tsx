import { useLoaderData } from "react-router";
import { useContext } from "react";
import { AuthContext } from "~/context";
import { fetchData } from "~/utils/fetchers";
import type { TTourSet } from "~/types";
import List from "~/components/List";

export const meta = () => {
  return [
    { title: "Open Tour Builder Admin" },
    { name: "description", content: "Welcome to Open Tour Builder Admin" },
  ];
};

export const clientLoader = async () => {
  const { data } = await fetchData({ path: "public/tour-sets" });
  return { tourSets: data.data };
};

clientLoader.hydrate = true as const;

const HomeRoute = () => {
  const { tourSets } = useLoaderData<{ tourSets: TTourSet[] }>();
  const { signedIn } = useContext(AuthContext);

  if (!signedIn) return <></>;

  return <List items={tourSets} handleDelete={() => {}} heading="Tour Site" />;
};

export default HomeRoute;
