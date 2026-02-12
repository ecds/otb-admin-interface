import {
  AdvancedMarker,
  Pin,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { StopMapContext } from "~/contexts";

interface Props {
  draggable?: boolean;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
  center?: boolean;
}

const MapMarker = ({ draggable, onDragEnd, center = false }: Props) => {
  const context = useContext(StopMapContext);
  if (!context) throw new Error("StopMapContext is undefined");
  const { iconColor, lat, lng, mapIcon, position } = context;
  const [markerRef, marker] = useAdvancedMarkerRef();
  const map = useMap();

  useEffect(() => {
    return () => {
      if (marker) marker.map = null;
    };
  }, [marker]);

  useEffect(() => {
    if (!center || !marker || !map || !lat || !lng) return;

    map.setCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
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
