import { useCallback, useContext, useEffect, useState } from "react";
import ClientOnly from "./ClientOnly";
import SelectInput from "./inputs/SelectInput";
import TourMap from "./map/TourMap.client";
import { FeedbackContext } from "~/contexts";
import { useTourStore } from "~/store/tourStore";
import { mapTypes } from "~/choices";
import TextInput from "./inputs/TextInput";
import MapOverlay, { type OverlayBounds } from "./map/MapOverlay.client";
import { useMap } from "@vis.gl/react-google-maps";
import FileUpload from "./inputs/FileUpload";
import { sendDelete, sendUpdate } from "~/utils/requests";
import { Deleting } from "./Saving";
import DeleteButton from "./buttons/DeleteButton";
import MapOverlayRectangle from "./map/MapOverlayRectangle";
import MapIconControls from "./map/MapIconControls";
import { Fieldset, Legend, Switch } from "@headlessui/react";
import ToolTip from "./inputs/ToolTip";
import { getErrorMessage } from "~/utils/errors";
import type { TTour } from "~/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownLeftAndUpRightToCenter,
  faExpand,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";

const MapControls = () => {
  const tour = useTourStore((s) => s.tour);
  const applyServerChange = useTourStore((s) => s.applyServerChange);
  const setTourMapIcon = useTourStore((s) => s.setTourMapIcon);
  const { setFeedback } = useContext(FeedbackContext);
  const [south, setSouth] = useState<number | undefined>(undefined);
  const [north, setNorth] = useState<number | undefined>(undefined);
  const [east, setEast] = useState<number | undefined>(undefined);
  const [west, setWest] = useState<number | undefined>(undefined);
  const [overlayDraggable, setOverlayDraggable] = useState<boolean>(false);
  const [uploading, setUploading] = useState<string | undefined>(undefined);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [columns, setColumns] = useState<boolean>(Boolean(tour?.map_overlay));
  const map = useMap();

  const overlay = tour?.map_overlay;

  useEffect(() => {
    if (!overlay) return;
    setSouth(overlay.south);
    setNorth(overlay.north);
    setEast(overlay.east);
    setWest(overlay.west);
  }, [overlay]);

  const setBounds = useCallback((next: OverlayBounds) => {
    setSouth(next.south);
    setNorth(next.north);
    setEast(next.east);
    setWest(next.west);
  }, []);

  if (!tour) return null;

  const bounds = { south, north, east, west };

  const overlayAdded = (updatedTour: unknown) => {
    const added = (updatedTour as TTour).map_overlay;
    if (added)
      applyServerChange((t) => {
        t.map_overlay = added;
      });
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
          <ClientOnly>
            <TourMap>
              <MapOverlay bounds={bounds} />
              <MapOverlayRectangle
                bounds={bounds}
                onBoundsChange={setBounds}
                draggable={overlayDraggable}
              />
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
            </TourMap>
          </ClientOnly>
        </div>
        <div
          className={`${tour.map_overlay ? "grid grid-cols-2" : "hidden"} ${columns ? "basis-1/2" : "basis-full"}`}
        >
          {tour.map_overlay && map && (
            <>
              <div className="mb-8 col-span-2 flex flex-row space-x-2">
                Drag Overlay to Position{" "}
                <Switch
                  checked={overlayDraggable}
                  onChange={setOverlayDraggable}
                  className="group relative flex h-7 w-14 cursor-pointer rounded-full bg-blue-500/10 p-1 ease-in-out focus:not-data-focus:outline-none data-checked:bg-blue-500/10 data-focus:outline data-focus:outline-blue-500"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-blue-500 shadow-lg ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-7"
                  />
                </Switch>
                <ToolTip>
                  You can use the the white dots in the corners and along the
                  sides to resize the overlay. Use this toggle if you want to
                  drag the map into position without moving the underlying map.
                </ToolTip>
              </div>

              <div className="col-span-2">
                Northeast Corner{" "}
                <ToolTip>
                  Latitude and longitude on the northeast corner of the overlay.
                </ToolTip>
              </div>
              <TextInput
                label="North"
                value={north ?? map.getBounds()?.getNorthEast().lat() ?? 0}
                model="map_overlay"
                id="north"
                type="text"
                valueType="number"
                itemId={tour.map_overlay.id}
                size="small"
              />
              <TextInput
                label="East"
                value={east ?? map.getBounds()?.getNorthEast().lng() ?? 0}
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
                value={south ?? map.getBounds()?.getSouthWest().lat() ?? 0}
                model="map_overlay"
                id="south"
                type="text"
                valueType="number"
                itemId={tour.map_overlay.id}
                size="small"
              />
              <TextInput
                label="West"
                value={west ?? map.getBounds()?.getSouthWest().lng() ?? 0}
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
