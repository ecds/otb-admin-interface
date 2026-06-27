import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  FeedbackContext,
  RecordContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import { request } from "~/utils/requests";
import { parseLinkHeader } from "~/utils/linkHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";
import { joinImage } from "~/utils/image_upload";
import type { TMedium } from "~/types";
import type { PaginationLinks } from "~/utils/linkHeader";

interface Props {
  onSuccess: (args: unknown) => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  itemIds: number[];
}

const ReuseMedia = ({ isOpen, setIsOpen, onSuccess, itemIds }: Props) => {
  const [media, setMedia] = useState<TMedium[] | undefined>(undefined);
  const [page, setPage] = useState<number>(1);
  const [paginationLinks, setPaginationLinks] =
    useState<PaginationLinks | null>(null);
  const { tour } = useContext(TourContext);
  const { recordId, recordModel } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);
  const { setFeedback } = useContext(FeedbackContext);

  useEffect(() => {
    const loadMedia = async () => {
      const { response, data } = await request({
        path: `${tour.tenant}/v4/admin/media?page=${page}&per=20&exclude=${itemIds}`,
      });
      if (response.ok) {
        setMedia(data);
        // @ts-expect-error: We know headers will be part of response.
        setPaginationLinks(parseLinkHeader(response.headers.get("link")));
      }
    };

    if (isOpen) loadMedia();
  }, [isOpen, tour, page, itemIds]);

  const addMedium = async (medium: TMedium) => {
    setIsOpen(false);
    setFeedback({ type: "success", message: `Adding ${medium.filename}` });
    const { response, data } = await joinImage({
      relatedType,
      recordModel,
      relatedModel,
      recordId,
      imageId: medium.id,
      tenant: tour.tenant,
    });
    if (response.ok && onSuccess) {
      onSuccess(data);
      setFeedback(undefined);
    }
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
