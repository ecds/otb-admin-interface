import { Checkbox, Fieldset, Legend } from "@headlessui/react";
import { useContext, useState } from "react";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { getErrorMessage } from "~/utils/errors";
import {
  faBicycle,
  faCar,
  faCircleCheck,
  faSquareCheck,
  faSubway,
  faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TTourTravelMode, TTravelMode, TTravelModeTitle } from "~/types";
import { sendCreate, sendDelete, sendUpdate } from "~/utils/requests";
import { faCircle, faSquare } from "@fortawesome/free-regular-svg-icons";
import { Saving } from "./Saving";

const ICON = (mode: TTravelModeTitle) => {
  switch (mode) {
    case "BICYCLING":
      return faBicycle;
    case "DRIVING":
      return faCar;
    case "TRANSIT":
      return faSubway;
    case "WALKING":
      return faWalking;
  }
};

type Props = {
  modes: TTravelMode[];
};

const TravelModes = ({ modes }: Props) => {
  const tour = useTourStore((s) => s.tour);
  const updateTourField = useTourStore((s) => s.updateTourField);
  const { setFeedback } = useContext(FeedbackContext);
  const [saving, setSaving] = useState<number | undefined>(undefined);

  if (!tour) return null;

  // A tour with no saved modes is treated as having every mode enabled.
  const enabledIds =
    tour.modes.length === 0
      ? modes.map((m) => m.id)
      : tour.modes.map((m) => m.id);
  const defaultMode = tour.mode ?? modes[0];

  const handleToggle = async (mode: TTravelMode) => {
    setSaving(mode.id);
    const existing = tour.modes.find((m) => m.id === mode.id);
    if (existing) {
      const { response, data } = await sendDelete({
        tenant: tour.tenant,
        record: existing.relation_id,
        body: { model: "tour_mode" },
      });
      if (response.ok) {
        updateTourField(
          "modes",
          useTourStore.getState().tour!.modes.filter((m) => m.id !== mode.id),
        );
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not disable this travel mode."),
        });
      }
    } else {
      const { response, data } = await sendCreate({
        tenant: tour.tenant,
        body: {
          model: "tour_mode",
          tour_mode: { tour_id: tour.id, mode_id: mode.id },
        },
      });
      if (response.ok) {
        updateTourField("modes", [
          ...useTourStore.getState().tour!.modes,
          data as TTourTravelMode,
        ]);
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not enable this travel mode."),
        });
      }
    }
    setSaving(undefined);
  };

  const handleDefault = async (mode: TTravelMode) => {
    const previous = tour.mode;
    updateTourField("mode", mode);
    setSaving(mode.id);
    const { response, data } = await sendUpdate({
      tenant: tour.tenant,
      record: tour.id,
      body: {
        model: "tour",
        tour: { mode_id: mode.id },
      },
    });
    if (!response.ok) {
      updateTourField("mode", previous);
      setFeedback({
        type: "error",
        message: getErrorMessage(
          data,
          "Could not set the default travel mode.",
        ),
      });
    }
    setSaving(undefined);
  };

  return (
    <Fieldset>
      <Legend className="text-2xl flex space-x-3 my-8">Travel Modes</Legend>
      <table className="capitalize text-left">
        <thead>
          <tr>
            <th scope="col" className="pe-6 py-3 font-medium text-lg">
              Mode
            </th>
            <th scope="col" className="pe-6 py-3 font-medium text-lg">
              Enable
            </th>
            <th scope="col" className="pe-6 py-3 font-medium text-lg">
              Default
            </th>
          </tr>
        </thead>
        <tbody>
          {modes.map((mode) => {
            return (
              <tr key={mode.id} className="">
                {saving === mode.id ? (
                  <th scope="row" colSpan={3}>
                    <Saving />
                  </th>
                ) : (
                  <>
                    <th
                      scope="row"
                      className="pe-6 py-4 font-medium text-heading whitespace-nowrap"
                    >
                      <FontAwesomeIcon icon={ICON(mode.title)} /> {mode.title}
                    </th>
                    <th
                      scope="row"
                      className="pe-6 py-4 font-medium text-heading whitespace-nowrap text-center"
                    >
                      <Checkbox
                        className="group block cursor-pointer"
                        id={`mode-${mode.id}`}
                        onChange={() => handleToggle(mode)}
                        checked={enabledIds.includes(mode.id)}
                      >
                        <FontAwesomeIcon
                          icon={
                            enabledIds.includes(mode.id)
                              ? faSquareCheck
                              : faSquare
                          }
                          className="group-data-checked:text-blue-500 text-2xl"
                        />
                      </Checkbox>
                    </th>
                    <th
                      scope="row"
                      className="pe-6 py-4 font-medium text-heading whitespace-nowrap text-center"
                    >
                      <label htmlFor={`radio-${mode.title}`}>
                        <FontAwesomeIcon
                          icon={
                            mode.id === defaultMode?.id
                              ? faCircleCheck
                              : faCircle
                          }
                          className={`${mode.id === defaultMode?.id ? "text-blue-500" : ""} text-2xl`}
                        />
                      </label>
                      <input
                        id={`radio-${mode.title}`}
                        type="radio"
                        className="hidden"
                        name="default-mode"
                        checked={mode.id === defaultMode?.id}
                        onChange={() => handleDefault(mode)}
                        disabled={!enabledIds.includes(mode.id)}
                      />
                    </th>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Fieldset>
  );
};

export default TravelModes;
