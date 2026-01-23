import { AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import type { TStop } from "~/types";

const MapMarker = ({ stop }: { stop: TStop }) => {
  if (stop) {
    return (
      <>
        <AdvancedMarker
          position={{
            lat: stop.lat,
            lng: stop.lng,
          }}
          title={stop.title}
        >
          {stop.icon ? (
            <img src={stop.icon} alt="" width={32} />
          ) : (
            <Pin
              scale={1}
              background={stop.icon_color}
              borderColor={stop.icon_color}
            >
              <span className={`text-white text-base`}>{stop.position}</span>
            </Pin>
          )}
        </AdvancedMarker>
      </>
    );
  }
};

export default MapMarker;
