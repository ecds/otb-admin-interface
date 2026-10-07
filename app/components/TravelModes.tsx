import { Checkbox, Fieldset, Legend } from "@headlessui/react";
import { useTourStore } from "~/store/tourStore";
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
import { faCircle, faSquare } from "@fortawesome/free-regular-svg-icons";

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

  if (!tour) return null;

  // A tour with no saved modes is treated as having every mode enabled.
  const enabledIds =
    tour.modes.length === 0
      ? modes.map((m) => m.id)
      : tour.modes.map((m) => m.id);
  const defaultMode = tour.mode ?? modes[0];

  // Autosave links or unlinks the mode.
  const handleToggle = (mode: TTravelMode) => {
    const existing = tour.modes.find((m) => m.id === mode.id);
    updateTourField(
      "modes",
      existing
        ? tour.modes.filter((m) => m.id !== mode.id)
        : [...tour.modes, mode as TTourTravelMode],
    );
  };

  const handleDefault = (mode: TTravelMode) => {
    updateTourField("mode", mode);
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
                {
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
                }
              </tr>
            );
          })}
        </tbody>
      </table>
    </Fieldset>
  );
};

export default TravelModes;
