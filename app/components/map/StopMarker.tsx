import { useContext } from "react";
import MapMarker from "./MapMarker";
import { StopMapContext } from "~/contexts";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const StopMarker = () => {
  const context = useContext(StopMapContext);
  const geocoderLib = useMapsLibrary("geocoding");

  if (!context) {
    throw new Error("StopMapContext is undefined");
  }
  const { setLat, setLng, setAddress } = context;

  const handleDragEnd = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const newLat = event.latLng?.lat();
    const newLng = event.latLng?.lng();

    if (setLat) setLat(newLat);
    if (setLng) setLng(newLng);

    if (geocoderLib) {
      const locater = new geocoderLib.Geocoder();
      locater.geocode(
        {
          location: { lat: newLat, lng: newLng },
        },
        (result, status) => {
          if (status === "OK" && result) {
            if (setAddress) setAddress(result[0].formatted_address);
          } else {
            console.error(status);
          }
        },
      );
    } else {
      // TODO: warn unable to update address.
    }
  };

  return <MapMarker draggable={true} onDragEnd={handleDragEnd} center={true} />;
};

export default StopMarker;
