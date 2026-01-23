import { useContext, useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";
import SelectInput from "./inputs/SelectInput";
import TourMap from "./map/TourMap.client";
import { OverlayContext, RecordContext } from "~/contexts";
import { mapTypes } from "~/choices";
import TextInput from "./inputs/TextInput";
import Toggle from "./inputs/Toggle";
import MapOverlay from "./map/MapOverlay";
import { useMap } from "@vis.gl/react-google-maps";

const MapControls = () => {
  const { tour } = useContext(RecordContext);
  const [south, setSouth] = useState<number | undefined>(undefined);
  const [north, setNorth] = useState<number | undefined>(undefined);
  const [east, setEast] = useState<number | undefined>(undefined);
  const [west, setWest] = useState<number | undefined>(undefined);
  const map = useMap();
  console.log("🚀 ~ MapControls ~ map:", map);

  useEffect(() => {
    if (!tour || !tour.map_overlay) return;
    setSouth(tour.map_overlay.south);
    setNorth(tour.map_overlay.north);
    setEast(tour.map_overlay.east);
    setWest(tour.map_overlay.west);
  }, [tour]);

  useEffect(() => {}, [south]);

  if (tour) {
    return (
      <OverlayContext.Provider
        value={{
          south,
          north,
          east,
          west,
          setSouth,
          setNorth,
          setEast,
          setWest,
        }}
      >
        <div
          className={`flex ${tour.map_overlay ? "flex-row-reverse" : "flex-col-reverse"} gap-8`}
        >
          <div
            className={`${tour.map_overlay ? "basis-full md:basis-1/2" : "w-full"}  h-144 drop-shadow-lg`}
          >
            <ClientOnly>
              <TourMap>
                <MapOverlay />
              </TourMap>
            </ClientOnly>
          </div>
          <div className="basis-full md:basis-1/2">
            <SelectInput
              id="map_type"
              label="Map Type"
              model="tour"
              value={tour?.map_type}
              options={mapTypes}
            />
            <div
              className={`${tour.map_overlay ? "grid" : "hidden"} grid-cols-2 gap-4`}
            >
              {tour.map_overlay && map && (
                <>
                  <TextInput
                    label="Overlay North"
                    value={north ?? map.getBounds()?.getNorthEast().lat() ?? 0}
                    model="map_overlay"
                    id="north"
                    type="text"
                    valueType="number"
                    helpText="Northern latitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                  />
                  <TextInput
                    label="Overlay South"
                    value={south ?? map.getBounds()?.getSouthWest().lat() ?? 0}
                    model="map_overlay"
                    id="south"
                    type="text"
                    valueType="number"
                    helpText="Northern latitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                  />
                  <TextInput
                    label="Overlay East"
                    value={east ?? map.getBounds()?.getNorthEast().lng() ?? 0}
                    model="map_overlay"
                    id="east"
                    type="text"
                    valueType="number"
                    helpText="Eastern longitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                  />
                  <TextInput
                    label="Overlay West"
                    value={west ?? map.getBounds()?.getSouthWest().lng() ?? 0}
                    model="map_overlay"
                    id="west"
                    type="text"
                    valueType="number"
                    helpText="Western longitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                  />
                  <div className="col-span-2">
                    <Toggle
                      label="Restrict Map to Overlay"
                      id="restrict_bounds_to_overlay"
                      value={tour.restrict_bounds_to_overlay}
                      model="tour"
                      helpText="Don't allow the map to be panned beyond the overlay."
                    />
                  </div>
                  <div className="col-span-2">
                    <Toggle
                      label="Blank Map"
                      id="blank_map"
                      value={tour.blank_map}
                      model="tour"
                      helpText="Covers the Google Map with a gray background."
                    />
                  </div>
                  <button className="bg-red-500 text-white p-2 rounded-md">
                    Remove Overlay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </OverlayContext.Provider>
    );
  }

  return <></>;
};

export default MapControls;
