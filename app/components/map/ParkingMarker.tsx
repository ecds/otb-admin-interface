import { faSquare, faSquareParking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  AdvancedMarker,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

export type ParkingProps = {
  parkingLat: number | undefined;
  parkingLng: number | undefined;
  setParkingLat: Dispatch<SetStateAction<number | undefined>>;
  setParkingLng: Dispatch<SetStateAction<number | undefined>>;
  setParkingAddress: Dispatch<SetStateAction<string | undefined>>;
};

const ParkingMarker = ({
  parkingLat,
  parkingLng,
  setParkingLat,
  setParkingLng,
  setParkingAddress,
}: ParkingProps) => {
  const geocoderLib = useMapsLibrary("geocoding");

  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (marker && (!parkingLat || !parkingLng)) marker.map = null;
  }, [marker, parkingLat, parkingLng]);

  const handleDragEnd = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const newLat = event.latLng?.lat();
    const newLng = event.latLng?.lng();

    setParkingLat(newLat);
    setParkingLng(newLng);

    if (geocoderLib) {
      const locater = new geocoderLib.Geocoder();
      locater.geocode(
        {
          location: { lat: newLat, lng: newLng },
        },
        (result, status) => {
          if (status === "OK" && result) {
            setParkingAddress(result[0].formatted_address);
          } else {
            console.error(status);
          }
        },
      );
    } else {
      // TODO: warn unable to update address.
    }
  };

  if (parkingLat && parkingLng) {
    return (
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: parkingLat, lng: parkingLng }}
        draggable
        onDragEnd={handleDragEnd}
      >
        <FontAwesomeIcon icon={faSquare} className="text-white text-4xl" />
        <FontAwesomeIcon
          icon={faSquareParking}
          className="text-blue-700 text-4xl fa-stack-1x"
        />
      </AdvancedMarker>
    );
  }

  return <></>;
};

export default ParkingMarker;
