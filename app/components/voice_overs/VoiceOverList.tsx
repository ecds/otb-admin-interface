import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router";
import { FeedbackContext, TourContext } from "~/contexts";
import { useSyncPoll } from "~/hooks/useSyncPoll";
import { sendDelete } from "~/utils/requests";
import { VOICE_OVER_LANGUAGES } from "~/utils/voice_over_languages";
import type { TVoiceOver } from "~/types";

interface Props {
  voiceOvers: TVoiceOver[];
}

const VoiceOverList = ({ voiceOvers }: Props) => {
  const { tour } = useContext(TourContext);
  const { setFeedback } = useContext(FeedbackContext);
  const revalidator = useRevalidator();
  const [itemToDelete, setItemToDelete] = useState<number | undefined>(
    undefined,
  );
  const itemToDeleteRef = useRef<number | undefined>(undefined);

  const currentVOs = tour.voice_overs.map((vo) => vo.id);
  const isPendingSync =
    itemToDelete !== undefined && currentVOs.includes(itemToDelete);

  useSyncPoll({
    pending: isPendingSync,
    revalidate: revalidator.revalidate,
    onTimeout: () => {
      setFeedback({
        type: "error",
        message: "Could not confirm the delete. Please refresh.",
      });
      itemToDeleteRef.current = undefined;
    },
  });

  useEffect(() => {
    if (!isPendingSync) setItemToDelete(undefined);
  }, [isPendingSync]);

  const handleDelete = async (id: number) => {
    if (!tour) return;
    setItemToDelete(id);
    itemToDeleteRef.current = id;
    await sendDelete({
      tenant: tour.tenant,
      record: id,
      body: {
        model: "voice_over",
        reindex: { id: tour.id, model: "tour" },
      },
    });
  };

  if ((!isPendingSync && voiceOvers.length === 0) || !tour) return <></>;

  return (
    <table
      className={`w-full p-8 m-auto mb-8 ${isPendingSync ? "opacity-50" : "opacity-100"}`}
    >
      <caption className="caption-top text-left">Voice Overs</caption>
      <thead className="">
        <tr className="">
          <th className="text-left">Filename</th>
          <th className="text-left">Language</th>
          <th className="max-w-fit">Delete</th>
        </tr>
      </thead>
      <tbody>
        {voiceOvers.map((vo, index) => {
          return (
            <tr
              key={vo.id}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-gray-white"} hover:bg-gray-200 py-8 my-8`}
            >
              <td className="p-2">{vo.filename}</td>
              <td className="p-2">
                {
                  VOICE_OVER_LANGUAGES.find((lng) => lng.value === vo.language)
                    ?.label
                }
              </td>
              <td className="text-center">
                <button onClick={() => handleDelete(vo.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default VoiceOverList;
