import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState } from "react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { useVoiceOvers } from "./useVoiceOvers";
import { sendDelete } from "~/utils/requests";
import { VOICE_OVER_LANGUAGES } from "~/utils/voice_over_languages";

interface Props {
  stopId?: number;
}

const VoiceOverList = ({ stopId }: Props) => {
  const tenant = useTourStore((s) => s.tour?.tenant);
  const tourId = useTourStore((s) => s.tour?.id);
  const { voiceOvers, setVoiceOvers } = useVoiceOvers(stopId);
  const { setFeedback } = useContext(FeedbackContext);
  const [deletingId, setDeletingId] = useState<number | undefined>(undefined);

  const handleDelete = async (id: number) => {
    if (!tenant || !tourId) return;
    setDeletingId(id);
    const { response } = await sendDelete({
      tenant,
      record: id,
      body: {
        model: "voice_over",
        reindex: { id: tourId, model: "tour" },
      },
    });
    setDeletingId(undefined);
    if (response.ok) {
      setVoiceOvers((current) => current.filter((vo) => vo.id !== id));
    } else {
      setFeedback({
        type: "error",
        message: "Could not delete voice over. Please try again.",
      });
    }
  };

  if (voiceOvers.length === 0) return <></>;

  const isDeleting = deletingId !== undefined;

  return (
    <table
      className={`w-full p-8 m-auto mb-8 ${isDeleting ? "opacity-50" : "opacity-100"}`}
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
                <button
                  onClick={() => handleDelete(vo.id)}
                  disabled={isDeleting}
                >
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
