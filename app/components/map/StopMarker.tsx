import MapMarker from "./MapMarker";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Dispatch, SetStateAction } from "react";
import type { TStop } from "~/types";

interface Props {
  stop: TStop;
  lat: number | undefined;
  lng: number | undefined;
  setLat: Dispatch<SetStateAction<number | undefined>>;
  setLng: Dispatch<SetStateAction<number | undefined>>;
  setAddress: Dispatch<SetStateAction<string | undefined>>;
}

const StopMarker = ({ stop, lat, lng, setLat, setLng, setAddress }: Props) => {
  const geocoderLib = useMapsLibrary("geocoding");

  const handleDragEnd = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    const newLat = event.latLng.lat();
    const newLng = event.latLng.lng();

    setLat(newLat);
    setLng(newLng);

    if (geocoderLib) {
      const locater = new geocoderLib.Geocoder();
      locater.geocode(
        { location: { lat: newLat, lng: newLng } },
        (result, status) => {
          if (status === "OK" && result) {
            setAddress(result[0].formatted_address);
          } else {
            console.error(status);
          }
        },
      );
    }
  };

  return (
    <MapMarker
      lat={lat}
      lng={lng}
      mapIcon={stop.map_icon}
      iconColor={stop.icon_color}
      position={stop.position}
      draggable={true}
      onDragEnd={handleDragEnd}
      center={true}
    />
  );
};

export default StopMarker;
