import { useContext, useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";
import SelectInput from "./inputs/SelectInput";
import TourMap from "./map/TourMap.client";
import {
  FormContext,
  OverlayContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import { mapTypes } from "~/choices";
import TextInput from "./inputs/TextInput";
import MapOverlay from "./map/MapOverlay";
import { useMap } from "@vis.gl/react-google-maps";
import FileUpload from "./inputs/FileUpload";
import { sendDelete, sendUpdate } from "~/utils/requests";
import { useRevalidator } from "react-router";
import { Deleting } from "./Saving";
import DeleteButton from "./media_grid/DeleteButton";
import type { TMapOverlay, TTour } from "~/types";

const MapControls = () => {
  const { tour, setIsSaving } = useContext(TourContext);
  const [south, setSouth] = useState<number | undefined>(undefined);
  const [north, setNorth] = useState<number | undefined>(undefined);
  const [east, setEast] = useState<number | undefined>(undefined);
  const [west, setWest] = useState<number | undefined>(undefined);
  const [newOverlay, setNewOverlay] = useState<TMapOverlay | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<boolean>(false);
  const revalidator = useRevalidator();
  const map = useMap();

  useEffect(() => {
    if (!tour.map_overlay) return;
    setSouth(tour.map_overlay.south);
    setNorth(tour.map_overlay.north);
    setEast(tour.map_overlay.east);
    setWest(tour.map_overlay.west);
  }, [tour]);

  useEffect(() => {
    if (!newOverlay) return;
    let intervalId: ReturnType<typeof setInterval>;
    if (tour.map_overlay?.id !== newOverlay?.id) {
      setIsSaving(true);
      intervalId = setInterval(revalidator.revalidate, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      setIsSaving(false);
    };
  }, [tour, newOverlay, revalidator, setIsSaving]);

  useEffect(() => {
    if (tour.map_overlay) setNewOverlay(undefined);
  }, [tour]);

  const overlayAdded = (updatedTour: unknown) => {
    setNewOverlay((updatedTour as TTour).map_overlay);
  };

  const deleteOverlay = async (id: number) => {
    setDeleting(true);
    await sendUpdate({
      record: tour.id,
      tenant: tour.tenant,
      body: {
        model: "tour",
        attribute: "blank_map",
        value: false,
      },
    });

    const { response } = await sendDelete({
      tenant: tour.tenant,
      record: id,
      body: {
        model: "map_overlay",
        reindex: { id: tour.id, model: "tour" },
      },
    });

    if (response.ok) {
      revalidator.revalidate();
      setDeleting(false);
    }
  };

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
          {!tour.map_overlay && (
            <RelatedContext
              value={{ relatedModel: "map_overlay", relatedType: "one" }}
            >
              <FileUpload
                model="map_overlay"
                onSuccess={overlayAdded}
                onStart={() => setIsSaving(true)}
                btnText="Upload Map Overlay"
              />
            </RelatedContext>
          )}
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
                  itemId={tour.map_overlay.id}
                  helpText="Northern latitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                />
                <TextInput
                  label="Overlay South"
                  value={south ?? map.getBounds()?.getSouthWest().lat() ?? 0}
                  model="map_overlay"
                  id="south"
                  type="text"
                  valueType="number"
                  itemId={tour.map_overlay.id}
                  helpText="Northern latitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                />
                <TextInput
                  label="Overlay East"
                  value={east ?? map.getBounds()?.getNorthEast().lng() ?? 0}
                  model="map_overlay"
                  id="east"
                  type="text"
                  valueType="number"
                  itemId={tour.map_overlay.id}
                  helpText="Eastern longitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                />
                <TextInput
                  label="Overlay West"
                  value={west ?? map.getBounds()?.getSouthWest().lng() ?? 0}
                  model="map_overlay"
                  id="west"
                  type="text"
                  valueType="number"
                  itemId={tour.map_overlay.id}
                  helpText="Western longitude bound of overlay. You can drag the circles in the northeast or southwest corner to adjust the size and position."
                />
                <div className="col-span-2">
                  <SelectInput
                    label="Restrict Map to Overlay"
                    id="restrict_bounds_to_overlay"
                    value={tour.restrict_bounds_to_overlay}
                    model="tour"
                    helpText="Don't allow the map to be panned beyond the overlay."
                  />
                </div>
                <div className="col-span-2">
                  <SelectInput
                    label="Blank Map"
                    id="blank_map"
                    value={tour.blank_map}
                    model="tour"
                    helpText="Covers the Google Map with a gray background."
                  />
                </div>
                <FormContext.Provider
                  value={{
                    handleDelete: deleteOverlay,
                    recordId: tour.map_overlay.id,
                  }}
                >
                  {deleting ? (
                    <Deleting />
                  ) : (
                    <DeleteButton removing="map overlay">
                      Remove Overlay{" "}
                    </DeleteButton>
                  )}
                </FormContext.Provider>
              </>
            )}
          </div>
        </div>
      </div>
    </OverlayContext.Provider>
  );
};

export default MapControls;
