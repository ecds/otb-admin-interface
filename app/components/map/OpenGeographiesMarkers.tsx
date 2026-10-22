import { useTourStore } from "~/store/tourStore";
import MapMarker from "./MapMarker";
import type { Map } from "maplibre-gl";
import type { TOpenGeographiesStop, TStop } from "~/types";

interface Props {
  map: Map;
  stops: TOpenGeographiesStop[];
}

// Open Geographies stops on a map. They can't be dragged (they're edited in
// Open Geographies) and use the tour's marker color and icon.
const OpenGeographiesMarkers = ({ map, stops }: Props) => {
  const iconColor = useTourStore((s) => s.tour?.icon_color);
  const mapIcon = useTourStore((s) => s.tour?.map_icon);

  return (
    <>
      {stops.map((stop) => (
        <MapMarker
          key={stop.id}
          map={map}
          draggable={false}
          stop={
            {
              ...stop,
              icon_color: iconColor,
              map_icon: mapIcon,
            } as unknown as TStop
          }
        />
      ))}
    </>
  );
};

export default OpenGeographiesMarkers;
