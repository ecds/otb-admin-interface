import {
  useContext,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { Fieldset, Input, Label } from "@headlessui/react";
import InputWrapper from "../inputs/InputWrapper";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { sendUpdate } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";

interface Props {
  stopId: number;
  lng: number | undefined;
  lat: number | undefined;
  address: string | undefined;
  setLat: Dispatch<SetStateAction<number | undefined>>;
  setLng: Dispatch<SetStateAction<number | undefined>>;
  setAddress: Dispatch<SetStateAction<string | undefined>>;
  prefix?: "parking";
}

const Location = ({
  stopId,
  lat,
  lng,
  address,
  setLat,
  setLng,
  setAddress,
  prefix,
}: Props) => {
  const addressInputRef = useRef<HTMLInputElement>(null);
  const latInputRef = useRef<HTMLInputElement>(null);
  const lngInputRef = useRef<HTMLInputElement>(null);
  const { setFeedback } = useContext(FeedbackContext);
  const tenant = useTourStore((s) => s.tour?.tenant);
  const stop = useTourStore((s) =>
    s.tour?.stops.find((st) => st.id === stopId),
  );
  const updateStopField = useTourStore((s) => s.updateStopField);
  const geocoderLib = useMapsLibrary("geocoding");
  const map = useMap();

  useEffect(() => {
    if (!map || !lat || !lng) return;

    map.setCenter({ lat, lng });
  }, [map, lat, lng]);

  const latKey = prefix ? "parking_lat" : "lat";
  const lngKey = prefix ? "parking_lng" : "lng";
  const addressKey = prefix ? "parking_address" : "address";

  useEffect(() => {
    if (!stop || !tenant) return;
    if (
      stop[latKey] === lat &&
      stop[lngKey] === lng &&
      stop[addressKey] === address
    )
      return;

    const timeoutId = setTimeout(async () => {
      const { response, data } = await sendUpdate({
        record: stopId,
        tenant,
        body: {
          model: "stop",
          stop: { [addressKey]: address, [latKey]: lat, [lngKey]: lng },
        },
      });

      if (response.ok) {
        updateStopField(stopId, latKey, lat);
        updateStopField(stopId, lngKey, lng);
        updateStopField(stopId, addressKey, address);
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(data, "Could not save the location."),
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    lat,
    lng,
    address,
    latKey,
    lngKey,
    addressKey,
    stop,
    stopId,
    tenant,
    updateStopField,
    setFeedback,
  ]);

  const handleInput = () => {
    if (
      !addressInputRef.current ||
      !latInputRef.current ||
      !lngInputRef.current
    )
      return;

    setAddress(addressInputRef.current.value);
    setLat(parseFloat(latInputRef.current.value));
    setLng(parseFloat(lngInputRef.current.value));
  };

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
    <Fieldset>
      <InputWrapper className="flex flex-col space-x-3">
        <Label className="block mb-2.5 font-medium text-black/75">
          Address
        </Label>
        <Input
          ref={addressInputRef}
          type="text"
          className={`w-full border border-default-medium border-gray-300 text-heading text-base rounded-base focus:ring-blue-100 focus:border-blue-100 block rounded-md shadow-xs placeholder:text-body px-4 py-3.5`}
          value={address}
          onInput={handleInput}
          onBlur={handleInput}
          onChange={handleInput}
        />
      </InputWrapper>

      <button
        className="cursor-pointer bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 mb-8 drop-shadow-md "
        onClick={locateAddress}
      >
        <FontAwesomeIcon icon={faLocationCrosshairs} />{" "}
        <>Locate {prefix} Address</>
      </button>
      <InputWrapper className="flex flex-col space-x-3">
        <Label className="block mb-2.5 font-medium text-black/75">
          Latitude
        </Label>
        <Input
          ref={latInputRef}
          type="number"
          className={`w-full border border-default-medium border-gray-300 text-heading text-base rounded-base focus:ring-blue-100 focus:border-blue-100 block rounded-md shadow-xs placeholder:text-body px-4 py-3.5`}
          value={lat}
          onInput={handleInput}
          onBlur={handleInput}
          onChange={handleInput}
          step="any"
        />
      </InputWrapper>
      <InputWrapper className="flex flex-col space-x-3">
        <Label className="block mb-2.5 font-medium text-black/75">
          Longitude
        </Label>
        <Input
          ref={lngInputRef}
          type="number"
          className={`w-full border border-default-medium border-gray-300 text-heading text-base rounded-base focus:ring-blue-100 focus:border-blue-100 block rounded-md shadow-xs placeholder:text-body px-4 py-3.5`}
          value={lng}
          onInput={handleInput}
          onBlur={handleInput}
          onChange={handleInput}
          step="any"
        />
      </InputWrapper>
    </Fieldset>
  );
};

export default Location;
