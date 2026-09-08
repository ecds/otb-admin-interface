import FileUpload from "./inputs/FileUpload";
import DeleteButton from "./buttons/DeleteButton";
import { FeedbackContext, FormContext, RecordContext } from "~/contexts";
import { useContext, useState } from "react";
import { sendUpdate } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";
import ToolTip from "./inputs/ToolTip";
import type { TTourSet } from "~/types";

interface Props {
  tourSet: TTourSet;
}

const SiteLogo = ({ tourSet }: Props) => {
  const [currentValue, setCurrentValue] = useState<string | undefined>(
    tourSet.logo_url,
  );
  const { setFeedback } = useContext(FeedbackContext);

  const onSuccess = (responseData: unknown) => {
    setCurrentValue((responseData as TTourSet).logo_url);
  };

  const handleDelete = async (id: number) => {
    setFeedback({ message: "Removing Logo...", type: "success" });
    const { response, data } = await sendUpdate({
      tenant: "public",
      record: id,
      body: {
        model: "tour_set",
        tour_set: { logo: null },
      },
    });

    if (response.ok) {
      setCurrentValue(undefined);
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not remove the site logo."),
      });
    }
  };

  if (!tourSet) return <></>;

  if (currentValue) {
    return (
      <RecordContext.Provider
        value={{ recordId: tourSet.id, recordModel: "tour_set" }}
      >
        <FormContext.Provider value={{ recordId: tourSet.id, handleDelete }}>
          <div className="flex flex-col space-y-4 mb-8">
            <img src={currentValue} alt="" className="w-min" />
            <FileUpload
              updateId={tourSet.id}
              model="tour_set"
              btnText="Update Site Logo"
              className="w-fit"
              onSuccess={onSuccess}
              attribute="logo"
            />
            <DeleteButton removing="Site Logo" className="w-fit">
              Remove Site Logo
            </DeleteButton>
          </div>
        </FormContext.Provider>
      </RecordContext.Provider>
    );
  }

  return (
    <FormContext.Provider value={{ recordId: tourSet.id }}>
      <div className="mb-8">
        <FileUpload
          model="tour_set"
          btnText="Upload Site Logo"
          updateId={tourSet.id}
          attribute="logo"
          onSuccess={onSuccess}
          className=""
        />{" "}
        <ToolTip>
          Upload an image to replace the OpenTour logo on your tours. Note: due
          to size and design considerations your image will be automatically
          proportionally resized to have a max width of 300 pixels and a max
          height of 80 pixels.
        </ToolTip>
      </div>
    </FormContext.Provider>
  );
};

export default SiteLogo;
