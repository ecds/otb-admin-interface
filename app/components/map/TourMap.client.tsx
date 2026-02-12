import { Map, useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { TourContext, StopMapContext } from "~/contexts";
import MapMarker from "./MapMarker";
import type { ReactNode } from "react";

const TourMap = ({ children }: { children: ReactNode }) => {
  const { tour } = useContext(TourContext);
  const map = useMap();

  useEffect(() => {
    if (!map || !tour.bounds) return;

    map.fitBounds({
      east: tour.bounds.east,
      south: tour.bounds.south,
      north: tour.bounds.north,
      west: tour.bounds.west,
    });
  }, [map, tour]);

  return (
    <Map
      defaultBounds={{
        south: 33.78777375347514,
        west: -84.32650829798354,
        north: 33.79178346667516,
        east: -84.3225714928132,
      }}
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
          <StopMapContext.Provider
            key={stop.id}
            value={{
              stop: stop,
              lat: stop.lat,
              lng: stop.lng,
              mapIcon: stop.map_icon,
              iconColor: stop.icon_color,
              position: stop.position,
              address: stop.address ?? "",
            }}
          >
            <MapMarker />
          </StopMapContext.Provider>
        );
      })}
    </Map>
  );
};

export default TourMap;
