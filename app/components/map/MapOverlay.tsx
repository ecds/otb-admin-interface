import { faUpRightAndDownLeftFromCenter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { useRevalidator } from "react-router";
import { OverlayContext, RecordContext } from "~/contexts";
import { debounce } from "~/utils/debounce";

const Handle = ({ className }: { className?: string }) => {
  return (
    <div
      className={`h-8 w-8 bg-pink-500 rounded-full text-lg text-white flex justify-center items-center-safe ${className}`}
    >
      <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
    </div>
  );
};

const MapOverlay = ({ editable = true }: { editable?: boolean }) => {
  const { tenant, tour } = useContext(RecordContext);
  const { south, north, east, west, setSouth, setNorth, setEast, setWest } =
    useContext(OverlayContext);
  const map = useMap();
  const revalidator = useRevalidator();

  useEffect(() => {
    if (!tour || !map) return;
    const worldBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180),
    );

    const mask = new google.maps.GroundOverlay("/blank.jpg", worldBounds);

    // Pass the click event through to the map
    const listener = mask.addListener(
      "click",
      (event: google.maps.MapMouseEvent) =>
        google.maps.event.trigger(map, "click", event),
    );
    if (tour.blank_map) {
      mask.setMap(map);
    }

    return () => {
      google.maps.event.removeListener(listener);
      mask.setMap(null);
    };
  }, [tour, map]);

  useEffect(() => {
    if (!map || !tour || !tour.map_overlay) return;
    if (!south || !north || !east || !west) return;

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(south, west),
      new google.maps.LatLng(north, east),
    );

    const overlay = new google.maps.GroundOverlay(
      tour.map_overlay.image_url,
      bounds,
    );

    // Pass the click event through to the map
    const listener = overlay.addListener(
      "click",
      (event: google.maps.MapMouseEvent) =>
        google.maps.event.trigger(map, "click", event),
    );

    overlay.setMap(map);

    return () => {
      google.maps.event.removeListener(listener);
      overlay.setMap(null);
    };
  }, [tour, tenant, map, south, north, east, west]);

  const handleDragStart = debounce(
    (
      event: google.maps.MapMouseEvent,
      corner: "Southeast" | "Northeast" | "Southwest" | "Northwest",
    ) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();
      if (!lat || !lng) return;
      switch (corner) {
        case "Southeast":
          if (setSouth) setSouth(lat);
          if (setEast) setEast(lng);
          if (tour && tour.map_overlay) tour.map_overlay.south = lat;
          break;
        case "Northeast":
          if (setNorth) setNorth(event.latLng?.lat());
          if (setEast) setEast(event.latLng?.lng());
          break;
        case "Northwest":
          if (setNorth) setNorth(event.latLng?.lat());
          if (setWest) setWest(event.latLng?.lng());
          break;
        case "Southwest":
          if (setSouth) setSouth(event.latLng?.lat());
          if (setWest) setWest(event.latLng?.lng());
          break;
        default:
          break;
      }
      revalidator.revalidate();
    },
    100,
  );

  const handleDragEnd = async () => {};

  if (
    !tour ||
    !tour.map_overlay ||
    !south ||
    !north ||
    !east ||
    !west ||
    !editable
  )
    return <></>;

  return (
    <>
      <AdvancedMarker
        position={{ lat: south, lng: east }}
        draggable
        onDrag={(event) => handleDragStart(event, "Southeast")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <Handle className="fa-rotate-90" />
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: north, lng: east }}
        draggable
        onDrag={(event) => handleDragStart(event, "Northeast")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <Handle />
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: south, lng: west }}
        draggable
        onDrag={(event) => handleDragStart(event, "Southwest")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <Handle />
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: north, lng: west }}
        draggable
        onDrag={(event) => handleDragStart(event, "Northwest")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <Handle className="fa-rotate-90" />
      </AdvancedMarker>
    </>
  );
};

export default MapOverlay;
