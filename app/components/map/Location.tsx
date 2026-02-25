import { useEffect, type Dispatch, type SetStateAction } from "react";
import TextInput from "../inputs/TextInput";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { TStop } from "~/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

interface Props {
  lng: number | undefined;
  lat: number | undefined;
  address: string | undefined;
  setLat: Dispatch<SetStateAction<number | undefined>>;
  setLng: Dispatch<SetStateAction<number | undefined>>;
  setAddress: Dispatch<SetStateAction<string | undefined>>;
  prefix?: "parking";
}

const Location = ({
  lat,
  lng,
  address,
  setLat,
  setLng,
  setAddress,
  prefix,
}: Props) => {
  const geocoderLib = useMapsLibrary("geocoding");
  const map = useMap();

  useEffect(() => {
    if (!map || !lat || !lng) return;

    map.setCenter({ lat, lng });
  }, [map, lat, lng]);

  const locateAddress = () => {
    if (!geocoderLib || !lat || !lng) return;

    const locater = new geocoderLib.Geocoder();
    const geoCoderOpts = address ? { address } : { location: { lat, lng } };
    locater.geocode(geoCoderOpts, (result, status) => {
      if (status === "OK" && result) {
        setLat(result[0].geometry.location.lat());
        setLng(result[0].geometry.location.lng());
        setAddress(result[0].formatted_address);
      } else {
        console.error(status);
      }
    });
  };

  if (!lat || !lng) return <></>;

  return (
    <>
      <TextInput
        type="text"
        value={address ?? ""}
        id={prefix ? `${prefix}_address` : "address"}
        label="Address"
        model="stop"
        updateCallback={(data) => setAddress((data as TStop).address)}
      />
      <button
        className="cursor-pointer bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 mb-8 drop-shadow-md "
        onClick={locateAddress}
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />{" "}
        <>Locate {prefix} Address</>
      </button>
      <TextInput
        type="text"
        valueType="number"
        value={lat}
        id={prefix ? `${prefix}_lat` : "lat"}
        label={<>{prefix} Latitude</>}
        model="stop"
      />
      <TextInput
        type="text"
        valueType="number"
        value={lng}
        id={prefix ? `${prefix}_lng` : "lng"}
        label={<>{prefix} Longitude</>}
        model="stop"
      />
    </>
  );
};

export default Location;
