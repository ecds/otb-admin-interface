import { Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";
import { useTourStore } from "~/store/tourStore";
import MapMarker from "./MapMarker";
import type { ReactNode } from "react";

const TourMap = ({ children }: { children: ReactNode }) => {
  const tour = useTourStore((s) => s.tour);
  const bounds = tour?.bounds;
  const map = useMap();

  // Only refit when the bounds themselves change, not on every tour edit.
  useEffect(() => {
    if (!map || !bounds) return;

    map.fitBounds({
      east: bounds.east,
      south: bounds.south,
      north: bounds.north,
      west: bounds.west,
    });
  }, [map, bounds?.east, bounds?.south, bounds?.north, bounds?.west]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tour) return null;

  return (
    <Map
      defaultBounds={{
        south: 33.78777375347514,
        west: -84.32650829798354,
        north: 33.79178346667516,
        east: -84.3225714928132,
      }}
      fullscreenControl
      zoomControl
      maxZoom={tour.blank_map ? 18 : undefined}
      disableDefaultUI
      mapTypeId={tour.map_type ?? "roadmap"}
      mapId={"bf51a910020fa25a"}
      restriction={{
        latLngBounds: {
          north: 84,
          south: -84,
          east: 179,
          west: -179,
        },
        strictBounds: true,
      }}
    >
      {children}
      {tour.stops.map((stop) => {
        if (!stop.lat || !stop.lng) return <></>;
        return (
          <MapMarker
            key={stop.id}
            lat={stop.lat}
            lng={stop.lng}
            mapIcon={stop.map_icon}
            iconColor={stop.icon_color}
            position={stop.position}
          />
        );
      })}
    </Map>
  );
};

export default TourMap;
