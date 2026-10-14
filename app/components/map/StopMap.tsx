import * as maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { useTourStore } from "~/store/tourStore";
import Location from "./Location";
import MarkerStyle from "./MarkerStyle";
import MapOverlay from "./MapOverlay";
import ParkingDisclosure from "../stops/ParkingDisclosure";
import { baseStyle, blank, hybrid, satellite } from "~/map_styles";
import MapMarker from "./MapMarker";
import {
  rememberAddressedPosition,
  updateAddressFromPosition,
} from "~/utils/geocode";
import TextInput from "../inputs/TextInput";
import type { TStop } from "~/types";

const StopMap = ({ stop }: { stop: TStop }) => {
  const [map, setMap] = useState<maplibregl.Map | undefined>(undefined);
  const mapType = useTourStore((s) => s.tour?.map_type);
  const blankMap = useTourStore((s) => s.tour?.blank_map);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const stopId = stop?.id;

  // The stop opens with its address matching its position, so leaving a
  // coordinate field unchanged doesn't replace it.
  useEffect(() => {
    const current = useTourStore
      .getState()
      .tour?.stops.find((s) => s.id === stopId);
    if (!current) return;
    rememberAddressedPosition(current.id, current.lat, current.lng);
    rememberAddressedPosition(
      current.id,
      current.parking_lat,
      current.parking_lng,
      true,
    );
  }, [stopId]);

  // After a latitude or longitude field is left, fill in the address for
  // the typed coordinates once both are set.
  const lookUpAddress = (parking: boolean) => () => {
    const current = useTourStore
      .getState()
      .tour?.stops.find((s) => s.id === stopId);
    const lat = parking ? current?.parking_lat : current?.lat;
    const lng = parking ? current?.parking_lng : current?.lng;
    if (!current || lat == null || lng == null) return;
    void updateAddressFromPosition(current.id, lat, lng, parking, {
      onlyIfMoved: true,
    });
  };

  // One map per stop and base map. Depending on the whole stop rebuilt it on
  // every edit, including each location lookup.
  useEffect(() => {
    const current = useTourStore
      .getState()
      .tour?.stops.find((s) => s.id === stopId);
    if (!current || !mapContainerRef.current) return;

    let style = baseStyle;

    if (blankMap) {
      style = blank;
    } else {
      switch (mapType) {
        case "satellite":
          style = satellite;
          break;
        case "hybrid":
          style = hybrid;
          break;
        default:
          style = baseStyle;
          break;
      }
    }

    // A stop without a location yet starts zoomed out on the tour.
    const located = current.lat != null && current.lng != null;
    const tourBounds = useTourStore.getState().tour?.bounds;
    const stopMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      ...(located
        ? { center: [current.lng, current.lat] as [number, number], zoom: 18 }
        : tourBounds
          ? {
              bounds: [
                [tourBounds.west, tourBounds.south],
                [tourBounds.east, tourBounds.north],
              ] as [[number, number], [number, number]],
            }
          : { center: [0, 0] as [number, number], zoom: 1 }),
    });

    setMap(stopMap);

    return () => {
      stopMap.remove();
      setMap(undefined);
    };
  }, [stopId, blankMap, mapType]);

  // Follow the stop when it's moved by a lookup or the coordinate fields.
  useEffect(() => {
    if (!map || stop?.lat == null || stop?.lng == null) return;
    map.easeTo({ center: [stop.lng, stop.lat] });
  }, [map, stop?.lat, stop?.lng]);

  if (stop) {
    return (
      <div className="grid grid-cols-2 min-h-144">
        <div className="px-4">
          <TextInput
            itemId={stop.id}
            type="text"
            value={stop.address ?? ""}
            id="address"
            label={"Address"}
            model="stop"
            helpText="You can update the stop location by Address or Latitude and Longitude and the other will update automatically. Once you enter your location by either means, click Locate Address. You can also click and drag the point on the map to update the location. If you enter Latitude and Logitude, you MUST enter BOTH fields or you will get a map error."
          />
          {stop.address && <Location stopId={stop.id} address={stop.address} />}
          <TextInput
            itemId={stop.id}
            type="text"
            valueType="number"
            value={stop.lat ?? ""}
            id="lat"
            updateCallback={lookUpAddress(false)}
            label={"Latitude"}
            model="stop"
            helpText="You can update the stop location by Address or Latitude and Longitude and the other will update automatically. Once you enter your location by either means, click Locate Address. You can also click and drag the point on the map to update the location. If you enter Latitude and Logitude, you MUST enter BOTH fields or you will get a map error."
          />
          <TextInput
            itemId={stop.id}
            type="text"
            valueType="number"
            value={stop.lng ?? ""}
            id="lng"
            updateCallback={lookUpAddress(false)}
            label={"Longitude"}
            model="stop"
            helpText="You can update the stop location by Address or Latitude and Longitude and the other will update automatically. Once you enter your location by either means, click Locate Address. You can also click and drag the point on the map to update the location. If you enter Latitude and Logitude, you MUST enter BOTH fields or you will get a map error."
          />
          <ParkingDisclosure stop={stop} map={map}>
            <TextInput
              itemId={stop.id}
              type="text"
              value={stop.parking_address ?? ""}
              id="parking_address"
              label={"Parking Address"}
              model="stop"
              helpText="You can update the stop location by Address or Latitude and Longitude and the other will update automatically. Once you enter your location by either means, click Locate Address. You can also click and drag the point on the map to update the location. If you enter Latitude and Logitude, you MUST enter BOTH fields or you will get a map error."
            />
            {stop.parking_address && (
              <Location
                stopId={stop.id}
                parking
                address={stop.parking_address}
              />
            )}
            <TextInput
              itemId={stop.id}
              type="text"
              valueType="number"
              value={stop.parking_lat ?? ""}
              id="parking_lat"
              updateCallback={lookUpAddress(true)}
              label={"Parking Latitude"}
              model="stop"
            />
            <TextInput
              itemId={stop.id}
              type="text"
              valueType="number"
              value={stop.parking_lng ?? ""}
              id="parking_lng"
              updateCallback={lookUpAddress(true)}
              label={"Parking Longitude"}
              model="stop"
            />
          </ParkingDisclosure>
          <MarkerStyle stopId={stop.id} />
        </div>
        <div ref={mapContainerRef} className="h-full w-full">
          {map && (
            <>
              <MapOverlay map={map} />
              {stop.parking_lat != null && stop.parking_lng != null && (
                <MapMarker stop={stop} map={map} parking />
              )}
              <MapMarker stop={stop} map={map} />
            </>
          )}
        </div>
      </div>
    );
  }

  return <></>;
};

export default StopMap;
