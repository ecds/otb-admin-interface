import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Legend, Radio, RadioGroup } from "@headlessui/react";
import { useContext, useState } from "react";
import { themes } from "~/choices";
import { useTourStore } from "~/store/tourStore";
import { sendUpdate } from "~/utils/requests";
import { FeedbackContext } from "~/contexts";
import { getErrorMessage } from "~/utils/errors";

const ThemeSelector = () => {
  const tour = useTourStore((s) => s.tour);
  const updateTourField = useTourStore((s) => s.updateTourField);
  const { setFeedback } = useContext(FeedbackContext);
  const [isSaving, setIsSaving] = useState(false);

  if (!tour) return null;

  const handleChange = async (themeId: number) => {
    const themeTitle = themes.find((t) => t.value === themeId)?.label ?? "";
    // Optimistic store update — UI reflects the new theme immediately.
    updateTourField("theme", { id: themeId, title: themeTitle });

    setIsSaving(true);
    const { response, data } = await sendUpdate({
      tenant: tour.tenant,
      record: tour.id,
      body: {
        model: "tour",
        attribute: "theme",
        value: themeId,
        related_model: "theme",
        related_type: "belongs_to",
      },
    });
    setIsSaving(false);

    if (!response.ok) {
      // Roll back the optimistic update.
      updateTourField("theme", tour.theme);
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not save the theme."),
      });
    }
  };

  return (
    <RadioGroup
      value={tour.theme.id}
      className="flex flex-row flex-wrap space-x-6 space-y-6 justify-center-safe items-baseline-last"
      onChange={handleChange}
      disabled={isSaving}
    >
      <Legend className="basis-full text-2xl">Themes</Legend>
      {themes.map((theme) => {
        return (
          <Field
            key={theme.value}
            className="border border-gray-300 rounded-md drop-shadow-lg cursor-pointer hover:border-gray-500"
          >
            <Radio value={theme.value} className="w-28 block data-checked:w-32">
              <img
                src={`/admin/otb-themes/${theme.label}.png`}
                alt=""
                className=""
              />
              <div className="text-center mt-2">
                <FontAwesomeIcon
                  className="text-blue-500"
                  icon={
                    tour.theme.id === theme.value ? faCheckSquare : faSquare
                  }
                />
              </div>
            </Radio>
          </Field>
        );
      })}
    </RadioGroup>
  );
};

export default ThemeSelector;
