import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState } from "react";
import { useTourStore } from "~/store/tourStore";
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
  const parking = {
    parkingLat,
    parkingLng,
    setParkingLat,
    setParkingLng,
    setParkingAddress,
  };
  const mapType = useTourStore((s) => s.tour?.map_type);
  const mapOverlay = useTourStore((s) => s.tour?.map_overlay);

  if (stop) {
    return (
      <>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <div className="flex flex-row w-full gap-8 mb-8">
            <div className="basis-1/2">
              <Location
                stopId={stop.id}
                lat={lat}
                lng={lng}
                address={address}
                setLat={setLat}
                setLng={setLng}
                setAddress={setAddress}
              />
              <MarkerStyle stopId={stop.id} />
              <ParkingDisclosure {...parking}>
                <Location
                  stopId={stop.id}
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
                    mapTypeId={mapType}
                    mapId={(Math.random() + 1).toString(36).substring(7)}
                    defaultCenter={{ lat, lng }}
                    defaultZoom={16}
                    onTilesLoaded={() => "loaded"}
                    zoomControl
                  >
                    {children}
                    {mapOverlay && (
                      <MapOverlay bounds={mapOverlay} editable={false} />
                    )}
                    <StopMarker
                      stop={stop}
                      lat={lat}
                      lng={lng}
                      setLat={setLat}
                      setLng={setLng}
                      setAddress={setAddress}
                    />
                    <ParkingMarker {...parking} />
                  </Map>
                </ClientOnly>
              )}
            </div>
          </div>
        </APIProvider>
      </>
    );
  }

  return <></>;
};

export default StopMap;
