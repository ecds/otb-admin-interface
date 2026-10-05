import { useContext, useState } from "react";
import FileUpload from "../inputs/FileUpload";
import ToolTip from "../inputs/ToolTip";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { useVoiceOvers } from "./useVoiceOvers";
import type { TVoiceOver } from "~/types";
import { sendUpload } from "~/utils/requests";
import InputWrapper from "../inputs/InputWrapper";
import Language from "./Language";
import { getErrorMessage } from "~/utils/errors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

interface Props {
  stop_id?: number;
  tour_id?: number;
}

const VoiceOverUpload = ({ stop_id, tour_id }: Props) => {
  const tenant = useTourStore((s) => s.tour?.tenant);
  const { voiceOvers, setVoiceOvers } = useVoiceOvers(stop_id);
  const { setFeedback } = useContext(FeedbackContext);

  const [isSaving, setLocalIsSaving] = useState(false);
  const [showLanguageOption, setShowLanguageOption] = useState<boolean>(false);
  const [voUpload, setVoUpload] = useState<FormData | undefined>(undefined);

  const takenLanguages = voiceOvers.map((vo) => vo.language);

  const selectLanguage = async (language: string) => {
    if (!voUpload || !tenant) return;

    setShowLanguageOption(false);
    voUpload.append("[voice_over][language]", language);
    setFeedback({ type: "success", message: "Uploading Voice Over" });
    setLocalIsSaving(true);

    const { response, data } = await sendUpload({
      tenant,
      body: voUpload,
    });

    setLocalIsSaving(false);
    setVoUpload(undefined);

    if (response.ok) {
      setVoiceOvers((current) => [...current, data as TVoiceOver]);
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not upload Voice Over File."),
      });
    }
  };

  const upload = async (inputElement: HTMLInputElement) => {
    if (!inputElement.files || inputElement.files.length === 0 || !tenant)
      return;

    const body = new FormData();
    body.append("model", "voice_over");
    body.append("[voice_over][file]", inputElement.files[0]);
    body.append("tenant", tenant);

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
      className={`flex flex-wrap space-x-3 ${isSaving ? "opacity-50" : "opacity-100"}`}
    >
      <FileUpload
        btnText={
          isSaving ? (
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
        disabled={isSaving}
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
