import { useContext, useEffect, useRef, useState } from "react";
import FileUpload from "../inputs/FileUpload";
import ToolTip from "../inputs/ToolTip";
import { FeedbackContext, RecordContext, TourContext } from "~/contexts";
import { sendUpload } from "~/utils/requests";
import InputWrapper from "../inputs/InputWrapper";
import Language from "./Language";
import { getErrorMessage } from "~/utils/errors";
import { useSyncPoll } from "~/hooks/useSyncPoll";
import { useRevalidator } from "react-router";
import type { TVoiceOver } from "~/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Props {
  stop_id?: number;
  tour_id?: number;
}

const VoiceOverUpload = ({ stop_id, tour_id }: Props) => {
  const { tour, setIsSaving } = useContext(TourContext);
  const { stop } = useContext(RecordContext);
  const { setFeedback } = useContext(FeedbackContext);
  const revalidator = useRevalidator();

  const [showLanguageOption, setShowLanguageOption] = useState<boolean>(false);
  const [voUpload, setVoUpload] = useState<FormData | undefined>(undefined);
  const savedValueRef = useRef<TVoiceOver | undefined>(undefined);

  // Whichever list this instance is scoped to, per the same stop_id/stop
  // check used when the upload is attached to a record below.
  const voiceOvers = stop_id && stop ? stop.voice_overs : tour.voice_overs;
  const takenLanguages = voiceOvers ? voiceOvers.map((vo) => vo.language) : [];

  const isPendingSync =
    savedValueRef.current !== undefined &&
    !voiceOvers.some((vo) => vo.id === savedValueRef.current?.id);

  useSyncPoll({
    pending: isPendingSync,
    revalidate: revalidator.revalidate,
    onTimeout: () => {
      setFeedback({
        type: "error",
        message: "Could not confirm the save. Please refresh.",
      });
      savedValueRef.current = undefined;
    },
  });

  useEffect(() => {
    if (!isPendingSync) savedValueRef.current = undefined;
  }, [isPendingSync]);

  const selectLanguage = async (language: string) => {
    if (!voUpload) return;

    setShowLanguageOption(false);

    voUpload.append("[voice_over][language]", language);

    setFeedback({ type: "success", message: "Uploading Voice Over" });

    setIsSaving(true);

    const { response, data } = await sendUpload({
      tenant: tour.tenant,
      body: voUpload,
    });

    if (response.ok) {
      setFeedback(undefined);
      savedValueRef.current = data;
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not upload Voice Over File."),
      });
    }

    setIsSaving(false);
    setVoUpload(undefined);
  };

  const upload = async (inputElement: HTMLInputElement) => {
    if (!inputElement.files || inputElement.files.length === 0 || !tour) return;

    const body = new FormData();
    body.append("model", "voice_over");
    body.append("[voice_over][file]", inputElement.files[0]);
    body.append("tenant", tour.tenant);

    if (stop_id) body.append("[voice_over][stop_id]", stop_id.toString());
    if (tour_id) body.append("[voice_over][tour_id]", tour_id.toString());

    setVoUpload(body);
    setShowLanguageOption(true);
  };

  const cancel = () => {
    setVoUpload(undefined);
    setShowLanguageOption(false);
  };

  return (
    <InputWrapper
      className={`flex flex-wrap space-x-3 ${isPendingSync ? "opacity-50" : "opacity-100"}`}
    >
      <FileUpload
        btnText={
          isPendingSync ? (
            <span>
              <FontAwesomeIcon icon={faSpinner} spin /> Saving
            </span>
          ) : (
            "Upload Voice Over"
          )
        }
        accept="audio/mpeg, audio/mp4, audio/m4a, audio/x-m4a"
        multiple={false}
        handleUpload={upload}
        disabled={isPendingSync}
      />
      <ToolTip>
        Upload an audio file to replace the robot voice that reads the
        description. Only MP3 or M4A files are accepted. You can add multiple
        for different languages. You will be asked to assign the language after
        uploading the file.
      </ToolTip>
      <Language
        takenLanguages={takenLanguages}
        show={showLanguageOption}
        onSelect={selectLanguage}
        onCancel={cancel}
      />
    </InputWrapper>
  );
};

export default VoiceOverUpload;
