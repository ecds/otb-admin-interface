import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Field, Legend, Radio, RadioGroup } from "@headlessui/react";
import { useContext, useEffect, useRef, useState } from "react";
import { themes } from "~/choices";
import { sendUpdate } from "~/utils/requests";
import { FeedbackContext, RecordContext, TourContext } from "~/contexts";
import { getErrorMessage } from "~/utils/errors";

interface Props {
  theme: number;
}

const ThemeSelector = ({ theme }: Props) => {
  const [currentValue, setCurrentValue] = useState<number>(theme);
  const valueRef = useRef<number>(currentValue);
  const { tour } = useContext(TourContext);
  const { recordId } = useContext(RecordContext);
  const { setFeedback } = useContext(FeedbackContext);

  useEffect(() => {
    const update = async () => {
      const { response, data } = await sendUpdate({
        tenant: tour.tenant,
        record: recordId,
        body: {
          model: "tour",
          attribute: "theme",
          value: currentValue,
          related_model: "theme",
          related_type: "belongs_to",
        },
      });

      if (response.ok) {
        valueRef.current = currentValue;
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not save the theme."),
        });
        setCurrentValue(valueRef.current);
      }
    };

    if (currentValue !== valueRef.current) update();
  }, [tour, recordId, currentValue, setFeedback]);

  return (
    <RadioGroup
      value={currentValue}
      className="flex flex-row flex-wrap space-x-6 space-y-6 justify-center-safe items-baseline-last"
      onChange={setCurrentValue}
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
                  icon={currentValue === theme.value ? faCheckSquare : faSquare}
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
