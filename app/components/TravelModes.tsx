import { Checkbox, Fieldset, Legend } from "@headlessui/react";
import { useContext, useState } from "react";
import { RelatedContext, TourContext } from "~/contexts";
import {
  faBicycle,
  faCar,
  faCircleCheck,
  faSquareCheck,
  faSubway,
  faWalking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { TTravelMode, TTravelModeTitle } from "~/types";
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

const TravelModes = () => {
  const { tour, modes, setIsSaving } = useContext(TourContext);
  const [tourModes, setTourModes] = useState<number[]>(() => {
    if (tour.modes.length == 0) {
      return modes.map((mode) => mode.id);
    }
    return tour.modes.map((mode) => mode.id);
  });
  const [currentDefaultMode, setCurrentDefaultMode] = useState<TTravelMode>(
    tour.mode ?? modes[0],
  );
  const [saving, setSaving] = useState<number | undefined>(undefined);

  const handleToggle = async (mode: TTravelMode) => {
    setSaving(mode.id);
    setIsSaving(true);
    if (tourModes.includes(mode.id)) {
      const relationId = tour.modes.find((m) => m.id === mode.id)?.relation_id;
      if (!relationId) return;
      const { response } = await sendDelete({
        tenant: tour.tenant,
        record: relationId,
        body: { model: "tour_mode" },
      });
      if (response.ok) {
        setTourModes(tourModes.filter((m) => m !== mode.id));
      }
    } else {
      const { response } = await sendCreate({
        tenant: tour.tenant,
        body: {
          model: "tour_mode",
          tour_mode: { tour_id: tour.id, mode_id: mode.id },
        },
      });
      if (response.ok) {
        setTourModes([...tourModes, mode.id]);
      }
    }
    setSaving(undefined);
    setIsSaving(false);
  };

  const handleDefault = async (mode: TTravelMode) => {
    setSaving(mode.id);
    setIsSaving(true);
    const { response } = await sendUpdate({
      tenant: tour.tenant,
      record: tour.id,
      body: { model: "tour", attribute: "mode_id", value: mode.id },
    });
    if (response.ok) {
      setCurrentDefaultMode(mode);
    }
    setSaving(undefined);
    setIsSaving(false);
  };

  return (
    <RelatedContext.Provider
      value={{ relatedModel: "tour_mode", relatedType: "many" }}
    >
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
                          checked={tourModes.includes(mode.id)}
                        >
                          <FontAwesomeIcon
                            icon={
                              tourModes.includes(mode.id)
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
                              mode.id === currentDefaultMode.id
                                ? faCircleCheck
                                : faCircle
                            }
                            className={`${mode.id === currentDefaultMode.id ? "text-blue-500" : ""} text-2xl`}
                          />
                        </label>
                        <input
                          id={`radio-${mode.title}`}
                          type="radio"
                          className="hidden"
                          name="default-mode"
                          checked={mode.id === currentDefaultMode.id}
                          onChange={() => handleDefault(mode)}
                          disabled={!tourModes.includes(mode.id)}
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
    </RelatedContext.Provider>
  );
};

export default TravelModes;
