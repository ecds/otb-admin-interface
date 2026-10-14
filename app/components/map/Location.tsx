import { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationCrosshairs,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { geocode, rememberAddressedPosition } from "~/utils/geocode";

interface Props {
  stopId: number;
  address: string | undefined;
  parking?: boolean;
}

// Finds the typed address and moves the stop (or its parking) there. The
// address is replaced with the tidied version the lookup returns.
const Location = ({ stopId, address, parking = false }: Props) => {
  const updateStopField = useTourStore((s) => s.updateStopField);
  const tenant = useTourStore((s) => s.tour?.tenant);
  const { setFeedback } = useContext(FeedbackContext);
  const [locating, setLocating] = useState(false);

  const locateAddress = async () => {
    if (!tenant || !address?.trim()) return;

    setLocating(true);
    const found = await geocode(tenant, address);
    setLocating(false);

    if (!found.ok) {
      setFeedback({ type: "error", message: found.error });
      return;
    }

    const { lat, lng, address: formatted } = found.result;
    updateStopField(stopId, parking ? "parking_lat" : "lat", lat);
    updateStopField(stopId, parking ? "parking_lng" : "lng", lng);
    updateStopField(stopId, parking ? "parking_address" : "address", formatted);
    rememberAddressedPosition(stopId, lat, lng, parking);
  };

  return (
    <button
      type="button"
      className="cursor-pointer bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 mb-8 drop-shadow-md disabled:opacity-50 disabled:cursor-wait"
      onClick={locateAddress}
      disabled={locating}
    >
      <FontAwesomeIcon
        icon={locating ? faSpinner : faLocationCrosshairs}
        spin={locating}
      />{" "}
      Locate {parking ? "Parking " : ""}Address
    </button>
  );
};

export default Location;
