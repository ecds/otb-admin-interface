import { useLoaderData, type LoaderFunctionArgs } from "react-router";
import { request } from "~/utils/requests";
import type { TAccessRequest } from "~/types";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: accessRequests, response } = await request({
    path: `${params.tourSet}/v4/admin/access_requests`,
  });
  const { data: modes } = await request({
    path: `${params.tourSet}/v4/public/modes`,
  });
  return { accessRequests, modes, response };
};

clientLoader.hydrate = true as const;

const ApproveRoute = () => {
  const { accessRequests } = useLoaderData<{
    accessRequests: TAccessRequest[];
  }>();
  return (
    <>
      <div className="my-24 grid grid-cols-6 w-5/6 mx-auto">
        <div>Name</div>
        <div>Email</div>
        <div>Requested Access</div>
        <div>Date Requested</div>
        <div className="col-span-2 text-center">Action</div>
        {accessRequests.map((request) => {
          return (
            <>
              <div>{request.user}</div>
              <div>{request.email}</div>
              {/* <div>
                {request.tour_ids ? `Edit tour ${request.tour}` : "Mange Site"}
              </div> */}
              <div>{request.date}</div>
              <div className="text-center">delete</div>
              <div className="text-center">approve</div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default ApproveRoute;
