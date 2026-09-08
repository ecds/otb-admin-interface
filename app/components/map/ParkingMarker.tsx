import { faSquare, faSquareParking } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  AdvancedMarker,
  useAdvancedMarkerRef,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { StopMapContext } from "~/contexts";

const ParkingMarker = () => {
  const geocoderLib = useMapsLibrary("geocoding");
  const context = useContext(StopMapContext);

  if (!context) {
    throw new Error("StopMapContext is undefined");
  }

  const {
    parkingLat,
    parkingLng,
    setParkingLat,
    setParkingLng,
    setParkingAddress,
  } = context;

  const [markerRef, marker] = useAdvancedMarkerRef();

  useEffect(() => {
    if (marker && (!parkingLat || !parkingLng)) marker.map = null;
  }, [marker, parkingLat, parkingLng]);

  const handleDragEnd = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const newLat = event.latLng?.lat();
    const newLng = event.latLng?.lng();

    if (setParkingLat) setParkingLat(newLat);
    if (setParkingLng) setParkingLng(newLng);

    if (geocoderLib) {
      const locater = new geocoderLib.Geocoder();
      locater.geocode(
        {
          location: { lat: newLat, lng: newLng },
        },
        (result, status) => {
          if (status === "OK" && result) {
            if (setParkingAddress)
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
