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
import type { ParkingProps } from "../map/ParkingMarker";
import type { ReactNode } from "react";
import { useMap } from "@vis.gl/react-google-maps";

type Props = ParkingProps & {
  children: ReactNode;
};

const ParkingDisclosure = ({
  children,
  parkingLat,
  parkingLng,
  setParkingLat,
  setParkingLng,
  setParkingAddress,
}: Props) => {
  const [isOpen, setIsOpen] = useState<boolean | undefined>(undefined);
  const map = useMap();

  useEffect(() => {
    if (!isOpen || !map) return;
    if (parkingLat && parkingLng) return;

    const onClick = (event: google.maps.MapMouseEvent) => {
      setParkingLat(event.latLng?.lat());
      setParkingLng(event.latLng?.lng());
    };

    const clickListener = map.addListener("click", onClick);

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [isOpen, parkingLat, parkingLng, setParkingLat, setParkingLng, map]);

  const handelRemove = () => {
    setParkingLat(undefined);
    setParkingLng(undefined);
    setParkingAddress(undefined);
  };

  return (
    <Disclosure>
      {({ open }) => (
        <>
          <DisclosureButton
            className="group flex w-full mt-8 bg-gray-200 justify-center py-2 rounded-sm cursor-pointer"
            onClick={() => setIsOpen(!open)}
          >
            <span className="me-2">Add Parking Location</span>
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
            {parkingLat && parkingLng ? (
              <>
                {children}
                <button
                  onClick={handelRemove}
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
