import {
  faChevronDown,
  faSquareParking,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import type { ReactNode } from "react";
import { useTourStore } from "~/store/tourStore";
import { updateAddressFromPosition } from "~/utils/geocode";
import type { TStop } from "~/types";
import type { Map, MapMouseEvent } from "maplibre-gl";

type Props = {
  children: ReactNode;
  stop: TStop;
  map: Map | undefined;
};

const ParkingDisclosure = ({ children, stop, map }: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const updateStopField = useTourStore((s) => s.updateStopField);

  useEffect(() => {
    if (!map || !isOpen || stop.parking_lat) return;

    const addParking = ({ lngLat }: MapMouseEvent) => {
      updateStopField(stop.id, "parking_lat", lngLat.lat);
      updateStopField(stop.id, "parking_lng", lngLat.lng);
      void updateAddressFromPosition(stop.id, lngLat.lat, lngLat.lng, true);
    };
    map.once("click", addParking);

    // Closing the panel (or a parking spot being set some other way) stops
    // waiting for the click.
    return () => {
      map.off("click", addParking);
    };
  }, [map, isOpen, stop.id, stop.parking_lat, updateStopField]);

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <DisclosureButton
            className="group flex w-full mt-8 bg-gray-200 justify-center py-2 rounded-sm cursor-pointer"
            onClick={() => setIsOpen(!open)}
          >
            <span className="me-2">{`${stop.parking_lat && stop.parking_lng ? "Edit" : "Add"} Parking Location`}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`transition-all ${open ? "fa-rotate-180" : ""} mt-1`}
            />
          </DisclosureButton>
          <DisclosurePanel
            className={
              "mt-4 origin-top transition duration-200 ease-out data-closed:-translate-y-6 data-closed:opacity-0"
            }
            transition
          >
            {stop.parking_lat != null && stop.parking_lng != null ? (
              <>
                {children}
                <button
                  onClick={() => {
                    updateStopField(stop.id, "parking_lat", null);
                    updateStopField(stop.id, "parking_lng", null);
                  }}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Remove Parking
                </button>
              </>
            ) : (
              <p className="bg-gray-200 px-4 -mt-4 pb-4">
                Click the map to add a parking location. Once added, you can
                drag the{" "}
                <FontAwesomeIcon
                  icon={faSquareParking}
                  className="text-blue-700 text-lg"
                />{" "}
                icon to refine the placement.
              </p>
            )}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};

export default ParkingDisclosure;
