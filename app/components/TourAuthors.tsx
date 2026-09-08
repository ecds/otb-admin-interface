import { Button, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useContext, useEffect, useState } from "react";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AuthContext, TourContext, TourSetContext } from "~/contexts";
import { request } from "~/utils/requests";
import type { TUser } from "~/types";

const TourAuthors = () => {
  const { currentUser, currentTenantAdmin } = useContext(AuthContext);
  const { tourSet } = useContext(TourSetContext);
  const { tour } = useContext(TourContext);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tourAuthors, setTourAuthors] = useState<TUser[] | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!tourSet) return;

    const fetchAuthors = async () => {
      const { data, response } = await request({
        path: `${tourSet.subdir}/v4/admin/tour_authors?tour_id=${tour.id}`,
        method: "GET",
      });

      if (response.ok) {
        setTourAuthors(data);
      }
    };

    if (currentUser?.super || currentTenantAdmin) fetchAuthors();
  }, [tourSet, tour, currentTenantAdmin, currentUser]);

  const close = () => setIsOpen(false);

  if ((currentUser?.super || currentTenantAdmin) && tourAuthors) {
    return (
      <>
        <Button
          className="bg-black/75 text-white px-2 py-1 mb-8 rounded-md drop-shadow-md active:drop-shadow-sm"
          onClick={() => setIsOpen(true)}
        >
          <FontAwesomeIcon icon={faUsers} /> Manage Tour Authors
        </Button>
        <Dialog
          open={isOpen}
          as="div"
          className="relative z-10 focus:outline-none"
          onClose={close}
        >
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                transition
                className="w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
              >
                <DialogTitle
                  as="h3"
                  className="text-base/7 font-medium text-black"
                >
                  Manage Tour Authors
                </DialogTitle>
                <p className="mt-2 text-sm/6 text-black/70">
                  Not yet implemented.
                </p>
                <div className="mt-4">
                  <Button
                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700"
                    onClick={close}
                  >
                    Got it, thanks!
                  </Button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </>
    );
  }

  return <></>;
};

export default TourAuthors;
