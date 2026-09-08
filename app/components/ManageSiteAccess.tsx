import { AnimatePresence, easeOut, motion } from "framer-motion";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons";
import { faChevronDown, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  CloseButton,
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Select,
} from "@headlessui/react";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { FeedbackContext, TourSetContext } from "~/contexts";
import { request, sendDelete } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";
import { useRevalidator } from "react-router";

const TourSelect = ({
  adminId,
  username,
}: {
  adminId: number;
  username: string;
}) => {
  const { tourSet } = useContext(TourSetContext);
  const [selectedTour, setSelectedTour] = useState<string | undefined>(
    undefined,
  );
  const selectRef = useRef<HTMLSelectElement>(null);
  const revalidator = useRevalidator();
  const [reassigned, setReassigned] = useState<boolean>(false);

  useEffect(() => {
    const reassign = async () => {
      const { response } = await sendDelete({
        tenant: tourSet.subdir,
        record: adminId,
        body: {
          model: "tour_set_admin",
        },
      });

      if (response.ok && selectRef.current) {
        const { response: tourAuthorResponse } = await request({
          path: `${tourSet.subdir}/v4/admin/tour_authors`,
          method: "POST",
          body: {
            tour_id: selectRef.current.value,
            username,
            model: "tour_author",
          },
        });

        if (tourAuthorResponse.ok) {
          revalidator.revalidate();
          setReassigned(true);
        }
      }
    };

    if (selectedTour && selectedTour === selectRef.current?.value) reassign();
  }, [adminId, tourSet, revalidator, selectedTour, username]);

  const handleSelect = () => {
    if (!selectRef.current) return;

    setSelectedTour(selectRef.current.value);
  };

  return (
    <Select
      ref={selectRef}
      className={`truncate w-[20ch]`}
      value={selectedTour ?? ""}
      onChange={handleSelect}
    >
      <option value="" disabled>
        Assign to Tour
      </option>
      {tourSet.tours.map((tour) => {
        return (
          <option key={tour.id} value={tour.id}>
            {tour.title}
          </option>
        );
      })}
    </Select>
  );
};

const ManageSiteAccess = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { tourSet } = useContext(TourSetContext);
  const { setFeedback } = useContext(FeedbackContext);

  const handleRevoke = async ({
    record,
    model,
  }: {
    record: number;
    model: string;
  }) => {
    const { response, data } = await sendDelete({
      record,
      tenant: tourSet.subdir,
      body: {
        model,
      },
    });

    if (response.ok) {
      document.getElementById(`${model}-${record}`)?.remove();
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not revoke access."),
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={
          "bg-black/75 text-white px-2 py-1 mb-8 rounded-md drop-shadow-md active:drop-shadow-sm"
        }
      >
        <FontAwesomeIcon icon={faUsers} /> Manage Site Access
      </Button>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30"></DialogBackdrop>
        <div className="fixed inset-0 w-screen p-4 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center">
            <DialogPanel className="w-11/12 space-y-4 border bg-white p-8 rounded-md">
              <div className="flex p-0 m-0 h-min justify-end w-full">
                <CloseButton
                  className={
                    "text-right text-xs border-2 border-black/45 py-1 px-2 rounded-md hover:bg-black/15"
                  }
                  aria-label="close dialog"
                >
                  DONE
                </CloseButton>
              </div>
              <DialogTitle className={"font-bold text-black/75 text-2xl"}>
                Admins and Tour Authors for{" "}
                <em className="text-black">{tourSet.name}</em>
              </DialogTitle>
              <Description as="div">
                <Disclosure as="div">
                  {({ open }) => (
                    <>
                      <DisclosureButton className="group mb-4 font-bold text-xl text-black/75">
                        Below is a list of admins and tour authors.{" "}
                        <span className="underline underline-offset-4 decoration-dashed">
                          More{" "}
                        </span>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className="transition duration-300 group-data-open:rotate-180"
                        />
                      </DisclosureButton>
                      <AnimatePresence initial={false}>
                        {open && (
                          <DisclosurePanel static as={Fragment}>
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              transition={{ duration: 0.2, ease: easeOut }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-row space-x-8 text-sm mb-4">
                                <div>
                                  <h3 className="text-lg">Admins can:</h3>
                                  <ul className="ms-4">
                                    <li>
                                      Create, delete, and publish tours and
                                      related content
                                    </li>
                                    <li>Approve new site admins</li>
                                    <li>Approve new tour authors</li>
                                    <li>View unpublished tours</li>
                                  </ul>
                                </div>
                                <div>
                                  <h3 className="text-lg">
                                    Tour Authors can edit specific tour content
                                    including:
                                  </h3>
                                  <ul className="ms-4">
                                    <li>Create, delete, and edit media</li>
                                    <li>Create, delete, and edit flat pages</li>
                                    <li>
                                      Approve new tour map options and overlays
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          </DisclosurePanel>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </Disclosure>
              </Description>
              <h3>Admins</h3>
              <table className="w-full text-sm">
                <thead className="font-bold">
                  <tr>
                    <td className="px-2">Admin</td>
                    <td>Change Access</td>
                    <td className="text-center">Revoke</td>
                  </tr>
                </thead>
                <tbody>
                  {tourSet.admins.map((admin, index) => {
                    return (
                      <tr
                        key={admin.id}
                        id={`tour_set_admin-${admin.id}`}
                        className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} py-8 my-8`}
                      >
                        <td className="p-2">{admin.display_name}</td>
                        <td>
                          <TourSelect
                            adminId={admin.id}
                            username={admin.display_name}
                          />
                        </td>
                        <td className="text-center">
                          <Button
                            aria-label={`Revoke access for ${admin.display_name}`}
                            className={"text-red-400"}
                            onClick={() =>
                              handleRevoke({
                                record: admin.id,
                                model: "tour_set_admin",
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faCircleXmark} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <h3>Tour Authors</h3>
              <table className="w-full text-sm">
                <thead className="font-bold">
                  <tr>
                    <td className="px-2">Author</td>
                    <td>Tour</td>
                    <td className="text-center">Revoke</td>
                  </tr>
                </thead>
                <tbody>
                  {tourSet.tour_authors.map((author, index) => {
                    return (
                      <tr
                        key={author.id}
                        id={`tour_author-${author.id}`}
                        className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} py-8 my-8`}
                      >
                        <td className="p-2">{author.user}</td>
                        <td className="p-2">{author.tour}</td>
                        <td className="text-center">
                          <Button
                            aria-label="Deny access request"
                            className={"text-red-400"}
                            onClick={() =>
                              handleRevoke({
                                record: author.id,
                                model: "tour_author",
                              })
                            }
                          >
                            <FontAwesomeIcon icon={faCircleXmark} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ManageSiteAccess;
