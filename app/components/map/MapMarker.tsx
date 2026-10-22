import {
  faCircle,
  faLocationPin,
  faSquare,
  faSquareParking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as maplibregl from "maplibre-gl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Map } from "maplibre-gl";
import type { TStop } from "~/types";
import { useTourStore } from "~/store/tourStore";
import { updateAddressFromPosition } from "~/utils/geocode";

interface Props {
  stop: TStop;
  map: Map | undefined;
  parking?: boolean;
  // Off for stops that can't be edited here (e.g. from Open Geographies).
  draggable?: boolean;
}

const MapMarker = ({ map, stop, parking = false, draggable = true }: Props) => {
  const updateStopField = useTourStore((s) => s.updateStopField);
  const lng = parking ? stop.parking_lng : stop.lng;
  const lat = parking ? stop.parking_lat : stop.lat;
  const hasPosition = lat != null && lng != null;

  // MapLibre moves the marker's element into its own container on the map,
  // so React must not own that element: it would later try to insert or
  // remove nodes next to it where it no longer is. MapLibre gets this plain
  // div, and React renders the icon inside it through a portal.
  const [element] = useState(() =>
    typeof document === "undefined" ? undefined : document.createElement("div"),
  );
  const [marker, setMarker] = useState<maplibregl.Marker | undefined>();

  // One marker per map and stop; position changes move it (below).
  useEffect(() => {
    if (!map || !element || !hasPosition) return;

    const created = new maplibregl.Marker({
      element,
      anchor: "bottom",
      draggable,
    });
    created.on("dragend", () => {
      if (!draggable) return;
      const position = created.getLngLat();
      updateStopField(stop.id, parking ? "parking_lat" : "lat", position.lat);
      updateStopField(stop.id, parking ? "parking_lng" : "lng", position.lng);
      void updateAddressFromPosition(
        stop.id,
        position.lat,
        position.lng,
        parking,
      );
    });
    setMarker(created);

    return () => {
      created.remove();
      setMarker(undefined);
    };
    // Position is applied by the effect below, so it isn't a dependency.
  }, [map, element, stop.id, parking, hasPosition, draggable, updateStopField]);

  useEffect(() => {
    if (!marker || !map || lat == null || lng == null) return;
    marker.setLngLat([lng, lat]);
    // addTo is a no-op once added; the first call needs a position.
    if (!marker.getElement().isConnected) marker.addTo(map);
  }, [marker, map, lat, lng]);

  if (!stop || !element) return null;

  const icon = (() => {
    // The parking marker always shows the parking icon, whatever the stop's.
    if (stop.map_icon && !parking) {
      return (
        <div
          className="custom-marker"
          style={{
            backgroundImage: `url(${stop.map_icon})`,
            width: "32px",
            height: "32px",
            backgroundSize: "cover",
          }}
        ></div>
      );
    }

    if (parking) {
      return (
        <span className="cursor-pointer fa-layers">
          <FontAwesomeIcon
            icon={faSquare}
            className="text-white"
            style={{ width: "32px", height: "32px" }}
          />
          <FontAwesomeIcon
            icon={faSquareParking}
            className="text-blue-600"
            style={{ width: "32px", height: "32px" }}
          />
        </span>
      );
    }

    if (!stop.map_icon) {
      return (
        <div className="cursor-pointer">
          <FontAwesomeIcon
            icon={faLocationPin}
            style={{
              color: stop.icon_color ?? "#d32f2f",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              filter: "drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.4))",
            }}
          />
          <span className={`fa-stack-1x fa-inverse text-center text-base`}>
            {stop.position === 0 ? (
              <FontAwesomeIcon
                icon={faCircle}
                className="text-xs text-black/35"
              />
            ) : (
              <>{stop.position}</>
            )}
          </span>
        </div>
      );
    }
    return null;
  })();

  return createPortal(icon, element);
};

export default MapMarker;
