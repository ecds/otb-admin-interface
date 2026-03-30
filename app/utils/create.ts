import { sendCreate } from "./requests";

export const createTour = async (tenant: string) => {
  return await sendCreate({
    tenant,
    body: {
      model: "tour",
      tour: {
        title: `New Tour ${Date.now()}`,
      },
    },
  });
};
