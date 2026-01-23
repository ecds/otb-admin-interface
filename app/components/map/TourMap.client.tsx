import { Map } from "@vis.gl/react-google-maps";
import { useContext } from "react";
import { RecordContext } from "~/contexts";
import MapMarker from "./MapMarker";
import type { ReactNode } from "react";

const TourMap = ({ children }: { children: ReactNode }) => {
  const { tour } = useContext(RecordContext);
  if (tour) {
    return (
      <Map
        defaultBounds={{
          east: tour.bounds.east,
          south: tour.bounds.south,
          north: tour.bounds.north,
          west: tour.bounds.west,
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
          return <MapMarker key={stop.id} stop={stop} />;
        })}
      </Map>
    );
  }

  return <></>;
};

export default TourMap;
