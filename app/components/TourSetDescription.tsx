import { useContext } from "react";
import { FeedbackContext } from "~/contexts";
import type { TTourSet } from "~/types";
import { getErrorMessage } from "~/utils/errors";
import { sendUpdate } from "~/utils/requests";
import TextInput from "./inputs/TextInput";

interface Props {
  tourSet: TTourSet;
}

const TourSetDescription = ({ tourSet }: Props) => {
  const { setFeedback } = useContext(FeedbackContext);

  const handleDescriptionUpdate = async (content: string | number) => {
    setFeedback({ type: "success", message: "Updating Description" });
    const { response, data } = await sendUpdate({
      tenant: "public",
      record: tourSet.id,
      body: {
        model: "tour_set",
        tour_set: { description: content.toString() },
      },
    });

    if (response.ok) {
      setFeedback(undefined);
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not create the new site."),
      });
    }
  };

  return (
    <TextInput
      type="rich-text"
      label="Description"
      value={tourSet.description}
      id="description"
      model="tour_set"
      helpText="This is an optional description for your site. It will appear above the list of tours."
      itemId={tourSet.id}
      onChange={handleDescriptionUpdate}
    />
  );
};

export default TourSetDescription;
