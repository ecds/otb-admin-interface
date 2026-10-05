import {
  AdvancedMarker,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface Props {
  lat: number | undefined;
  lng: number | undefined;
  mapIcon?: string;
  iconColor?: string;
  position: number;
  draggable?: boolean;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
  center?: boolean;
}

const MapMarker = ({
  lat,
  lng,
  mapIcon,
  iconColor,
  position,
  draggable,
  onDragEnd,
  center = false,
}: Props) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const map = useMap();

  useEffect(() => {
    return () => {
      if (marker) marker.map = null;
    };
  }, [marker]);

  useEffect(() => {
    if (!center || !marker || !map || !lat || !lng) return;

    map.setCenter({ lat, lng });
    map.setZoom(16);
  }, [center, marker, map, lat, lng]);

  if (!lat || !lng) return <></>;

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        draggable={draggable}
        onDragEnd={onDragEnd}
        position={{
          lat,
          lng,
        }}
      >
        {mapIcon ? (
          <img src={mapIcon} alt="" width={42} />
        ) : (
          <Pin scale={1} background={iconColor} borderColor={iconColor}>
            <span className={`text-white text-base`}>{position}</span>
          </Pin>
        )}
      </AdvancedMarker>
    </>
  );
};

export default MapMarker;
