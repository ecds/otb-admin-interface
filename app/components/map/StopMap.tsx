import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useContext, useState } from "react";
import { OverlayContext, StopMapContext, TourContext } from "~/contexts";
import ClientOnly from "../ClientOnly";
import StopMarker from "./StopMarker";
import ParkingMarker from "./ParkingMarker";
import Location from "./Location";
import MarkerStyle from "./MarkerStyle";
import MapOverlay from "./MapOverlay.client";
import ParkingDisclosure from "../stops/ParkingDisclosure";
import type { ReactNode } from "react";
import type { TStop } from "~/types";

const StopMap = ({ stop, children }: { stop: TStop; children?: ReactNode }) => {
  const [lat, setLat] = useState<number | undefined>(stop.lat);
  const [lng, setLng] = useState<number | undefined>(stop.lng);
  const [parkingLat, setParkingLat] = useState<number | undefined>(
    stop.parking_lat,
  );
  const [parkingLng, setParkingLng] = useState<number | undefined>(
    stop.parking_lng,
  );
  const [address, setAddress] = useState<string | undefined>(stop.address);
  const [parkingAddress, setParkingAddress] = useState<string | undefined>(
    stop.parking_address,
  );
  const [mapIcon, setMapIcon] = useState<string | undefined>(stop.map_icon);
  const [iconColor, setIconColor] = useState<string | undefined>(
    stop.icon_color,
  );
  const [position, setPosition] = useState<number>(stop.position);
  const { tour } = useContext(TourContext);

  if (stop) {
    return (
      <StopMapContext.Provider
        value={{
          lat,
          lng,
          parkingLat,
          parkingLng,
          address,
          parkingAddress,
          setLat,
          setLng,
          setAddress,
          setParkingAddress,
          setParkingLat,
          setParkingLng,
          stop,
          mapIcon,
          iconColor,
          position,
          setMapIcon,
          setIconColor,
          setPosition,
        }}
      >
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <div className="flex flex-row w-full gap-8 mb-8">
            <div className="basis-1/2">
              <Location
                lat={lat}
                lng={lng}
                address={address}
                setLat={setLat}
                setLng={setLng}
                setAddress={setAddress}
              />
              <MarkerStyle />
              <ParkingDisclosure>
                <Location
                  prefix="parking"
                  lat={parkingLat}
                  lng={parkingLng}
                  address={parkingAddress}
                  setLat={setParkingLat}
                  setLng={setParkingLng}
                  setAddress={setParkingAddress}
                />
              </ParkingDisclosure>
            </div>
            <div className="h-auto basis-1/2">
              {lat && lng && (
                <ClientOnly>
                  <Map
                    disableDefaultUI
                    mapTypeId={tour.map_type}
                    mapId={(Math.random() + 1).toString(36).substring(7)}
                    defaultCenter={{ lat, lng }}
                    defaultZoom={16}
                    onTilesLoaded={() => "loaded"}
                    zoomControl
                  >
                    {children}
                    {tour.map_overlay && (
                      <OverlayContext.Provider
                        value={{
                          south: tour.map_overlay.south,
                          north: tour.map_overlay.north,
                          east: tour.map_overlay.east,
                          west: tour.map_overlay.west,
                          draggable: false,
                        }}
                      >
                        <MapOverlay editable={false} />
                      </OverlayContext.Provider>
                    )}
                    <StopMarker />
                    <ParkingMarker />
                  </Map>
                </ClientOnly>
              )}
            </div>
          </div>
        </APIProvider>
      </StopMapContext.Provider>
    );
  }

  return <></>;
};

export default StopMap;
