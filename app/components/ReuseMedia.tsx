import { useTenant } from "~/store/tourStore";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Select,
} from "@headlessui/react";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { FeedbackContext, TourSetContext } from "~/contexts";
import { request } from "~/utils/requests";
import { parseLinkHeader } from "~/utils/linkHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";
import { joinImage } from "~/utils/image_upload";
import { getErrorMessage } from "~/utils/errors";
import type { TJoin, TMedium } from "~/types";
import type { PaginationLinks } from "~/utils/linkHeader";

interface Props {
  join: TJoin;
  onSuccess: (args: unknown) => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  itemIds: number[];
}

const ReuseMedia = ({ join, isOpen, setIsOpen, onSuccess, itemIds }: Props) => {
  const [media, setMedia] = useState<TMedium[] | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [paginationLinks, setPaginationLinks] =
    useState<PaginationLinks | null>(null);
  const [tourFilter, setTourFilter] = useState<string>("0");
  const selectRef = useRef<HTMLSelectElement>(null);
  const tenant = useTenant();
  const { setFeedback } = useContext(FeedbackContext);
  const { tourSet } = useContext(TourSetContext);

  useEffect(() => {
    const loadMedia = async () => {
      let query = `page=${page}&per=20&exclude=${itemIds}`;
      if (tourFilter !== "0") query = `${query}&tour_id=${tourFilter}`;
      const { response, data } = await request({
        path: `${tenant}/v4/admin/media?${query}`,
      });
      if (response.ok) {
        setMedia(data);
        // @ts-expect-error: We know headers will be part of response.
        setPaginationLinks(parseLinkHeader(response.headers.get("link")));
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not load media to reuse."),
        });
      }
    };

    if (isOpen) loadMedia();
  }, [isOpen, tenant, page, itemIds, setFeedback, tourFilter]);

  const addMedium = async (medium: TMedium) => {
    setIsOpen(false);
    setFeedback({ type: "success", message: `Adding ${medium.filename}` });
    const { response, data } = await joinImage({
      ...join,
      imageId: medium.id,
      tenant,
    });
    if (response.ok && onSuccess) {
      onSuccess(data);
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, `Could not add ${medium.filename}.`),
      });
    }
  };

  const handleFilterSelect = () => {
    if (!selectRef.current) return;
    setTourFilter(selectRef.current.value);
  };

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
              <DialogTitle className="font-bold grow">
                Other Available Media
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="flex flex-col items-center text-xs justify-self-end"
              >
                <FontAwesomeIcon icon={faCircleXmark} className="text-base" />
                Close
              </button>
              <Description>
                Click to Add Media to Current Tour or Stop
                <Select
                  ref={selectRef}
                  name="by-tour"
                  aria-label="Filter by Tour"
                  onChange={handleFilterSelect}
                  className="border data-focus:bg-blue-100 data-hover:shadow"
                >
                  <option value={"0"} selected={tourFilter === "0"}>
                    All Tours
                  </option>
                  {tourSet.tours.map((tour) => {
                    return (
                      <option key={`filter-${tour.id}`} value={tour.id}>
                        {tour.title}
                      </option>
                    );
                  })}
                </Select>
              </Description>
            </div>
            <div className="overflow-scroll h-full pb-44 p-8 ">
              <div className="flex flex-row flex-wrap gap-12 space-y-8 mb-8 items-center justify-center">
                {media?.map((medium) => {
                  return (
                    <button
                      key={medium.id}
                      onClick={() => addMedium(medium)}
                      className="max-w-64"
                    >
                      <div
                        className={`flex items-center justify-center drop-shadow-lg hover:drop-shadow-2xl  cursor-pointer bg-center bg-contain bg-no-repeat`}
                      >
                        <img
                          src={medium.files.mobile}
                          alt=""
                          className="h-32"
                        />
                        {medium.embed_id && (
                          <FontAwesomeIcon
                            icon={faPlayCircle}
                            className="text-6xl text-white/55 absolute"
                          />
                        )}
                      </div>
                      <p className="text-sm mt-2 overflow-hidden truncate">
                        {medium.filename}
                      </p>
                    </button>
                  );
                })}
              </div>
              {paginationLinks && (
                <Pagination
                  links={paginationLinks}
                  current={page}
                  setCurrent={setPage}
                />
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
};

export default ReuseMedia;
