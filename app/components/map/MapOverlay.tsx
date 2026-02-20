import { useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { OverlayContext, TourContext } from "~/contexts";

const MapOverlay = ({ editable = true }: { editable?: boolean }) => {
  const { tour } = useContext(TourContext);
  const { south, north, east, west } = useContext(OverlayContext);
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const worldBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180),
    );

    const mask = new google.maps.GroundOverlay("/admin/blank.jpg", worldBounds);

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
    if (!map || !tour.map_overlay) return;
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
    const mapBounds = map.getBounds();
    if (mapBounds) {
      map.fitBounds(mapBounds.extend(new google.maps.LatLng(south, west)));
      map.fitBounds(mapBounds.extend(new google.maps.LatLng(north, east)));
    }

    return () => {
      google.maps.event.removeListener(listener);
      overlay.setMap(null);
    };
  }, [tour, map, south, north, east, west]);

  if (!tour.map_overlay || !south || !north || !east || !west || !editable)
    return <></>;

  return <></>;
};

export default MapOverlay;
