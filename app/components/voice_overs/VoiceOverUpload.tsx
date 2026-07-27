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

interface Props {
  stop_id?: number;
  tour_id?: number;
}

const VoiceOverUpload = ({ stop_id, tour_id }: Props) => {
  const { tour } = useContext(TourContext);
  const { stop } = useContext(RecordContext);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [uploaded, setUploaded] = useState<boolean>(false);
  const [showLanguageOption, setShowLanguageOption] = useState<boolean>(false);
  const [takenLanguages, setTakenLanguages] = useState<string[]>([]);
  const [voUpload, setVoUpload] = useState<FormData | undefined>(undefined);
  const { setFeedback } = useContext(FeedbackContext);
  const savedValueRef = useRef<TVoiceOver | undefined>(undefined);
  const revalidator = useRevalidator();

  const savedInPayload = () => {
    if (stop && stop_id) {
      return !stop.voice_overs.some(
        (vo) => vo.id === savedValueRef.current?.id,
      );
    }
    return !tour.voice_overs.some((vo) => vo.id === savedValueRef.current?.id);
  };

  const isPendingSync = savedValueRef.current !== undefined && savedInPayload();

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

  useEffect(() => {
    if (tour) setTakenLanguages(tour.voice_overs.map((vo) => vo.language));
    if (stop) setTakenLanguages(stop.voice_overs.map((vo) => vo.language));
  }, [stop, tour]);

  useEffect(() => {
    if (!language || !voUpload) return;
    const upload = async () => {
      setShowLanguageOption(false);
      voUpload.append("[voice_over][language]", language);
      setFeedback({ type: "success", message: "Uploading Voice Over" });
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
        setVoUpload(undefined);
      }

      setUploaded(true);
    };

    upload();
  }, [language, setFeedback, tour, voUpload]);

  useEffect(() => {
    if (uploaded) {
      setVoUpload(undefined);
      setLanguage(undefined);
      setShowLanguageOption(false);
    }
  }, [uploaded]);

  useEffect(() => {
    if (!voUpload) setUploaded(false);
  }, [voUpload]);

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

  return (
    <InputWrapper className="flex flex-wrap space-x-3">
      <FileUpload
        btnText="Upload Voice Over"
        accept="audio/mpeg, audio/mp4, audio/m4a, audio/x-m4a"
        multiple={false}
        handleUpload={upload}
      />
      <ToolTip>
        Upload an audio file to replace the robot voice that reads the
        description. Only MP3 or M4A files are accepted. You can add multiple
        for different languages. You will be asked to assign the language after
        uploading the file.
      </ToolTip>
      <Language
        language={language}
        setLanguage={setLanguage}
        takenLanguages={takenLanguages}
        show={showLanguageOption}
      />
    </InputWrapper>
  );
};

export default VoiceOverUpload;
