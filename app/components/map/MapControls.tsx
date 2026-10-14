import * as maplibregl from "maplibre-gl";
import { useContext, useEffect, useRef, useState } from "react";
import SelectInput from "../inputs/SelectInput";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { mapTypes } from "~/choices";
import TextInput from "../inputs/TextInput";
import MapOverlay from "./MapOverlay";
import FileUpload from "../inputs/FileUpload";
import { sendDelete, sendUpdate } from "~/utils/requests";
import { Deleting } from "../Saving";
import DeleteButton from "../buttons/DeleteButton";
import MapOverlayRectangle from "./MapOverlayRectangle";
import MapIconControls from "./MapIconControls";
import { Fieldset, Legend, Switch } from "@headlessui/react";
import ToolTip from "../inputs/ToolTip";
import { getErrorMessage } from "~/utils/errors";
import { fitOverlayAspect, hasOverlayAspect } from "~/utils/overlayAspect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import MapMarker from "./MapMarker";
import { baseStyle, blank, hybrid, satellite } from "~/map_styles";
import "maplibre-gl/dist/maplibre-gl.css";
import type { TTour } from "~/types";

const MapControls = () => {
  const tour = useTourStore((s) => s.tour);
  const applyServerChange = useTourStore((s) => s.applyServerChange);
  const updateTourField = useTourStore((s) => s.updateTourField);
  const setTourMapIcon = useTourStore((s) => s.setTourMapIcon);
  const { setFeedback } = useContext(FeedbackContext);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [dragOverlay, setDragOverlay] = useState<boolean>(false);
  const [uploading, setUploading] = useState<string | undefined>(undefined);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [columns, setColumns] = useState<boolean>(Boolean(tour?.map_overlay));
  const [map, setMap] = useState<maplibregl.Map | undefined>(undefined);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const tourId = tour?.id;
  const blankMap = tour?.blank_map;
  const mapType = tour?.map_type;

  // Rebuilt only when the base map changes. Depending on the whole tour
  // recreated the map (and flashed it) on every edit and save.
  useEffect(() => {
    const tour = useTourStore.getState().tour;
    if (!tour || !mapContainerRef.current) return;

    const bounds = new maplibregl.LngLatBounds(
      new maplibregl.LngLat(tour.bounds.west, tour.bounds.south),
      new maplibregl.LngLat(tour.bounds.east, tour.bounds.north),
    );

    let style = baseStyle;

    if (blankMap) {
      style = blank;
    } else {
      switch (mapType) {
        case "satellite":
          style = satellite;
          break;
        case "hybrid":
          style = hybrid;
          break;
        default:
          style = baseStyle;
          break;
      }
    }

    const tourMap = new maplibregl.Map({
      container: mapContainerRef.current,
      style,
      bounds,
    });

    setMap(tourMap);

    return () => {
      tourMap.remove();
      setMap(undefined);
    };
  }, [tourId, blankMap, mapType]);

  if (!tour) return null;

  const overlayAdded = (updatedTour: unknown) => {
    const added = (updatedTour as TTour).map_overlay;
    if (added)
      applyServerChange((t) => {
        t.map_overlay = added;
      });
  };

  // Restores the image's own shape; autosave sends the new bounds and the
  // rectangle and image follow the store.
  const resetAspect = () => {
    const current = tour.map_overlay;
    const fitted = current && fitOverlayAspect(current);
    if (fitted) updateTourField("map_overlay", { ...current, ...fitted });
    setLockAspect(true);
  };

  const deleteOverlay = async (id: number) => {
    setDeleting(true);
    const { response: blankMapResponse, data: blankMapData } = await sendUpdate(
      {
        record: tour.id,
        tenant: tour.tenant,
        body: {
          model: "tour",
          tour: { blank_map: false },
        },
      },
    );

    if (!blankMapResponse.ok) {
      setFeedback({
        type: "error",
        message: getErrorMessage(
          blankMapData,
          "Could not remove the map overlay.",
        ),
      });
      setDeleting(false);
      return;
    }
    applyServerChange((t) => {
      t.blank_map = false;
    });

    const { response, data } = await sendDelete({
      tenant: tour.tenant,
      record: id,
      body: {
        model: "map_overlay",
        reindex: { id: tour.id, model: "tour" },
      },
    });

    if (response.ok) {
      applyServerChange((t) => {
        t.map_overlay = undefined;
      });
    } else {
      setFeedback({
        type: "error",
        message: getErrorMessage(data, "Could not remove the map overlay."),
      });
    }
    setDeleting(false);
  };

  return (
    <Fieldset className={``}>
      <Legend className="text-2xl flex space-x-3 my-8">Map Options</Legend>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div>
          <SelectInput
            itemId={tour.id}
            label="Enable Map"
            value={tour.is_geo}
            id="is_geo"
            model="tour"
            helpText="Show stops on a map."
          />
          <SelectInput
            itemId={tour.id}
            label="Provide Google Directions"
            value={tour.use_directions}
            id="use_directions"
            model="tour"
            helpText="Display directions between stops. Directions are provided by Google. You will be able to provide directions for walking, driving, biking, and transit."
          />
          <SelectInput
            itemId={tour.id}
            label="Restrict Map Bounds"
            value={tour.restrict_bounds}
            id="restrict_bounds"
            model="tour"
            helpText="Select to prevent people from zooming out far from your tour or scrolling far away. This restricts the desktop/laptop map to the area around the tour stops."
          />
        </div>
        <div>
          <TextInput
            itemId={tour.id}
            label="Icon Color"
            type="color"
            value={tour.icon_color ?? "#D32F2F"}
            model="tour"
            id="icon_color"
            helpText="Select a color for the map maker. Be sure to pick a color that is easily seen on the map and the stop number is readable."
            updateCallback={() => {}}
          />
          <div className="-mt-6 mb-8">
            <MapIconControls
              target={{ model: "tour", recordId: tour.id }}
              hasIcon={Boolean(tour.map_icon)}
              onChange={setTourMapIcon}
              removeLabel="Remove Tour Icon"
              removeHelp="Stops without their own icon will go back to the colored pin."
              uploadHelp="Upload an icon used for every stop in this tour that doesn't have its own. The file must be an image (jpeg, png, or webp) and no larger than 80 by 80 pixels."
            />
          </div>
        </div>
        <div className="col-span-2">
          <SelectInput
            itemId={tour.id}
            id="map_type"
            label="Map Type"
            model="tour"
            value={tour?.map_type}
            options={mapTypes}
          />
        </div>
      </div>

      <div className={`grid ${columns ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
        <div
          className={`h-144 mb-8`}
          // Moves map to second column. Using flexbox breaks the map when toggled.
          style={{ order: columns ? 1 : 0 }}
        >
          <div ref={mapContainerRef} className="h-full w-full">
            {map && (
              <>
                {tour?.stops.map((stop) => {
                  return (
                    <MapMarker
                      key={`full-tour-map-${stop.id}`}
                      stop={stop}
                      map={map}
                    />
                  );
                })}
                <MapOverlay map={map} />
                <MapOverlayRectangle
                  map={map}
                  mode={lockAspect ? "opposite-fixed" : "opposite"}
                  draggable={dragOverlay}
                />
              </>
            )}
          </div>
          {tour.map_overlay && (
            <div className="flex flex-row space-x-2 justify-end my-4">
              <button
                onClick={() => setColumns(!columns)}
                className="cursor-pointer bg-blue-300 hover:bg-blue-500 h-8 text-black/75 hover:text-white/75 px-2 rounded-sm drop-shadow-lg"
              >
                <FontAwesomeIcon
                  icon={
                    columns
                      ? faUpRightAndDownLeftFromCenter
                      : faDownLeftAndUpRightToCenter
                  }
                />{" "}
                Show {columns ? "Wider" : "Smaller"} Map
              </button>
              <button
                type="button"
                onClick={resetAspect}
                disabled={hasOverlayAspect(tour.map_overlay)}
                title={
                  fitOverlayAspect(tour.map_overlay)
                    ? undefined
                    : "The image's size isn't known yet."
                }
                className="cursor-pointer bg-blue-300 hover:bg-blue-500 h-8 text-black/75 hover:text-white/75 px-2 rounded-sm drop-shadow-lg disabled:opacity-50 disabled:cursor-default disabled:hover:bg-blue-300 disabled:hover:text-black/75"
              >
                Reset Aspect Ratio
              </button>
              {deleting ? (
                <Deleting />
              ) : (
                <DeleteButton
                  removing="map overlay"
                  onDelete={() => deleteOverlay(tour.map_overlay!.id)}
                >
                  Remove Overlay{" "}
                </DeleteButton>
              )}
            </div>
          )}
        </div>
        <div
          className={`${tour.map_overlay ? "grid grid-cols-2" : ""} ${columns ? "basis-1/2" : "basis-full"}`}
        >
          {tour.map_overlay && (
            <>
              <div className="mb-8 flex flex-row space-x-2 col-span-2">
                <Switch
                  // Always locked while rotated: resizing the sides separately
                  // would skew the overlay.
                  aria-label="Lock Aspect Ratio"
                  checked={lockAspect || Boolean(tour.map_overlay.rotation)}
                  onChange={setLockAspect}
                  disabled={Boolean(tour.map_overlay.rotation)}
                  className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 data-checked:bg-blue-600 data-disabled:cursor-not-allowed data-disabled:opacity-50"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
                </Switch>
                <span className="mx-2">Lock Aspect Ratio</span>{" "}
                <ToolTip>
                  When on, dragging a corner resizes the overlay without
                  changing the image&apos;s proportions. Always on while the
                  overlay is rotated; to change the proportions, set the
                  rotation to 0 first.
                </ToolTip>
              </div>
              <div className="mb-8 flex flex-row space-x-2 col-span-2">
                <Switch
                  checked={dragOverlay}
                  onChange={setDragOverlay}
                  className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 data-checked:bg-blue-600 data-disabled:cursor-not-allowed data-disabled:opacity-50"
                >
                  <span className="size-4 translate-x-1 rounded-full bg-white transition group-data-checked:translate-x-6" />
                </Switch>
                <span className="mx-2">Drag Overlay</span>{" "}
                <ToolTip>
                  If enabled, the overlay can be dragged to a new location.
                </ToolTip>
              </div>

              <div className="col-span-2">
                <TextInput
                  label="Rotation (degrees)"
                  type="range"
                  valueType="number"
                  range={{ min: -180, max: 180 }}
                  value={tour.map_overlay.rotation ?? 0}
                  model="map_overlay"
                  id="rotation"
                  itemId={tour.map_overlay.id}
                  helpText="Turns the overlay clockwise around its center."
                />
              </div>

              <div className="col-span-2">
                Northeast Corner{" "}
                <ToolTip>
                  Latitude and longitude on the northeast corner of the overlay.
                </ToolTip>
              </div>
              <TextInput
                label="North"
                value={
                  tour.map_overlay.north ?? map?.getBounds().getNorth() ?? 0
                }
                model="map_overlay"
                id="north"
                type="text"
                valueType="number"
                itemId={tour.map_overlay.id}
                size="small"
              />
              <TextInput
                label="East"
                value={tour.map_overlay.east ?? map?.getBounds().getEast() ?? 0}
                model="map_overlay"
                id="east"
                type="text"
                valueType="number"
                itemId={tour.map_overlay.id}
                size="small"
              />
              <div className="col-span-2">
                Southwest Corner
                <ToolTip>
                  Latitude and longitude on the southwest corner of the overlay.
                </ToolTip>
              </div>
              <TextInput
                label="South"
                value={
                  tour.map_overlay.south ?? map?.getBounds()?.getSouth() ?? 0
                }
                model="map_overlay"
                id="south"
                type="text"
                valueType="number"
                itemId={tour.map_overlay.id}
                size="small"
              />
              <TextInput
                label="West"
                value={
                  tour.map_overlay.west ?? map?.getBounds()?.getWest() ?? 0
                }
                model="map_overlay"
                id="west"
                type="text"
                valueType="number"
                itemId={tour.map_overlay.id}
                size="small"
              />
              <div className="col-span-2">
                <SelectInput
                  itemId={tour.id}
                  label="Restrict Map to Overlay"
                  id="restrict_bounds_to_overlay"
                  value={tour.restrict_bounds_to_overlay}
                  model="tour"
                  helpText="Don't allow the map to be panned beyond the overlay."
                />
              </div>
              <div className="col-span-2">
                <SelectInput
                  itemId={tour.id}
                  label="Blank Map"
                  id="blank_map"
                  value={tour.blank_map}
                  model="tour"
                  helpText="Covers the Google Map with a gray background."
                />
              </div>
            </>
          )}
        </div>
      </div>
      {!tour.map_overlay && (
        <FileUpload
          join={{
            relatedModel: "map_overlay",
            relatedType: "one",
            recordModel: "tour",
            recordId: tour.id,
          }}
          model="map_overlay"
          onSuccess={overlayAdded}
          fileUploading={setUploading}
          disabled={!!uploading}
          btnText={uploading ? "Uploading…" : "Upload Map Overlay"}
        />
      )}
    </Fieldset>
  );
};

export default MapControls;
