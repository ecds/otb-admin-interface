import { useContext, useEffect, useState } from "react";
import { TourContext } from "~/contexts";
import { request } from "~/utils/requests";
import { Description, Dialog, DialogPanel } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faCopy,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { parseLinkHeader, type PaginationLinks } from "~/utils/linkHeader";
import Pagination from "./Pagination";
import type { Dispatch, SetStateAction } from "react";
import type { TFlatPage, TServerResponse, TStop } from "~/types";
import ToolTip from "./inputs/ToolTip";
import DeleteButton from "./buttons/DeleteButton";

interface Props<T extends TFlatPage | TStop> {
  itemIds: number[];
  model: "stops" | "flat_pages";
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  copy: (item: T | undefined) => Promise<void>;
  add: (item: TServerResponse) => Promise<unknown>;
}

const Reuse = <T extends TFlatPage | TStop>({
  itemIds,
  model,
  isOpen,
  setIsOpen,
  copy,
  add,
}: Props<T>) => {
  const [items, setItems] = useState<T[] | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const { tour } = useContext(TourContext);
  const [paginationLinks, setPaginationLinks] =
    useState<PaginationLinks | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      const { response, data, headers } = await request({
        path: `${tour.tenant}/v4/admin/${model}?page=${page}&per=20&exclude=${itemIds}`,
      });
      if (response.ok) {
        setItems(data);
        const links = headers?.get("link");
        if (links) setPaginationLinks(parseLinkHeader(links));
      }
    };

    if (isOpen) loadItems();
  }, [tour, itemIds, model, isOpen, page]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel className="w-[80vw] h-[80vh] space-y-4 border bg-white overflow-hidden">
            <div className="grid grid-cols-2 p-4">
              {/* <DialogPanel className="font-bold grow capitalize"> */}
              Other Available {model}
              {/* </DialogPanel> */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center text-xs justify-self-end"
              >
                <FontAwesomeIcon icon={faCircleXmark} className="text-base" />
                Close
              </button>
              <Description className="capitalize">
                Click to Add {model} to Current Tour or Stop
              </Description>
            </div>
            <div className="overflow-scroll h-full pb-44 p-4">
              <div className="relative overflow-x-auto shadow-xs">
                <table className="w-full text-sm text-left rtl:text-right text-body">
                  <thead className="text-sm text-body bg-neutral-secondary-medium border-b border-default-medium">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 font-medium capitalize text-lg"
                      >
                        {model}
                      </th>
                      <th scope="col" className="px-6 py-3 font-medium text-lg">
                        Add{" "}
                        <ToolTip>
                          Add a stop from another tour. If you edit the stop in
                          one tour, the changes will appear in other tours. If
                          you would like to add the stop but only have changes
                          affect a signal tour, use the copy function.
                        </ToolTip>
                      </th>
                      <th scope="col" className="px-6 py-3 font-medium text-lg">
                        Copy{" "}
                        <ToolTip>
                          Copy a stop from another tour. if you edit the stop in
                          one tour, the changes will not appear in other tours.
                          If you would like to have edits apply to other tours,
                          use the add function.
                        </ToolTip>
                      </th>
                      <th scope="col" className="px-6 py-3 font-medium text-lg">
                        Delete{" "}
                        <ToolTip>
                          You can only delete a stop if it is not part of tour.
                        </ToolTip>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items?.map((item) => {
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-default hover:bg-neutral-secondary-medium"
                        >
                          <th
                            scope="row"
                            className="px-6 py-4 font-medium text-heading whitespace-nowrap"
                          >
                            {item.title}
                          </th>
                          <td className="px-6 py-4">
                            <button
                              className="bg-blue-500 px-2 py-1 text-white rounded-md shadow-md"
                              onClick={() => {
                                setIsOpen(false);
                                add(item);
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} /> Add
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              className="bg-blue-500 px-2 py-1 text-white rounded-md shadow-md"
                              onClick={() => {
                                setIsOpen(false);
                                copy(item);
                              }}
                            >
                              <FontAwesomeIcon icon={faCopy} /> Copy
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <DeleteButton
                              disabled={item.orphaned}
                              removing={model}
                              className={`${item.orphaned ? "bg-black/50" : "bg-red-500"} px-2 py-1 text-white rounded-md shadow-md`}
                            >
                              Delete
                            </DeleteButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot></tfoot>
                </table>
                {paginationLinks && (
                  <Pagination
                    links={paginationLinks}
                    current={page}
                    setCurrent={setPage}
                  />
                )}
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default Reuse;
