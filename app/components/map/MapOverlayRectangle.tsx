import { useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect, useRef } from "react";
import { FeedbackContext } from "~/contexts";
import type { OverlayBounds } from "./MapOverlay.client";
import { useTourStore } from "~/store/tourStore";
import { debounce } from "~/utils/debounce";
import { sendUpdate } from "~/utils/requests";
import { getErrorMessage } from "~/utils/errors";

interface Props {
  bounds: OverlayBounds;
  onBoundsChange: (bounds: OverlayBounds) => void;
  draggable: boolean;
}

const MapOverlayRectangle = ({
  bounds: { south, north, east, west },
  onBoundsChange,
  draggable,
}: Props) => {
  const map = useMap();
  const tenant = useTourStore((s) => s.tour?.tenant);
  const tourId = useTourStore((s) => s.tour?.id);
  const overlayId = useTourStore((s) => s.tour?.map_overlay?.id);
  const updateTourField = useTourStore((s) => s.updateTourField);
  const { setFeedback } = useContext(FeedbackContext);
  const rectangleRef = useRef<google.maps.Rectangle | undefined>(undefined);

  useEffect(() => {
    if (!map) return;
    if (!south || !north || !east || !west) return;

    const handleDrag = debounce(async () => {
      if (!rectangleRef.current) return;
      const newBounds = rectangleRef.current.getBounds();
      if (!newBounds || !tenant || !tourId || !overlayId) return;

      const bounds = {
        south: newBounds.getSouthWest().lat(),
        west: newBounds.getSouthWest().lng(),
        north: newBounds.getNorthEast().lat(),
        east: newBounds.getNorthEast().lng(),
      };

      onBoundsChange(bounds);

      const { response, data } = await sendUpdate({
        tenant,
        record: overlayId,
        body: {
          model: "map_overlay",
          map_overlay: bounds,
          reindex: {
            id: tourId,
            model: "tour",
          },
        },
      });

      if (response.ok) {
        const current = useTourStore.getState().tour?.map_overlay;
        if (current?.id === overlayId)
          updateTourField("map_overlay", { ...current, ...bounds });
      } else {
        setFeedback({
          type: "error",
          message: getErrorMessage(
            data,
            "Could not save the map overlay position.",
          ),
        });
      }
    }, 300);

    map.setOptions({ gestureHandling: "greedy" });

    rectangleRef.current = new google.maps.Rectangle({
      bounds: new google.maps.LatLngBounds(
        new google.maps.LatLng(south, west),
        new google.maps.LatLng(north, east),
      ),
      map,
      draggable,
      strokeColor: "deeppink",
      fillOpacity: 0,
      editable: !draggable,
      clickable: true,
      zIndex: 10,
    });

    let dragEndListener: google.maps.MapsEventListener | undefined,
      boundsListener: google.maps.MapsEventListener | undefined;

    if (draggable) {
      dragEndListener = google.maps.event.addListener(
        rectangleRef.current,
        "dragend",
        handleDrag,
      );
    } else {
      boundsListener = google.maps.event.addListener(
        rectangleRef.current,
        "bounds_changed",
        handleDrag,
      );
    }

    return () => {
      if (rectangleRef.current) {
        rectangleRef.current.setMap(null);
        rectangleRef.current = undefined;
      }
      if (boundsListener) boundsListener.remove();
      if (dragEndListener) dragEndListener.remove();
    };
  }, [
    map,
    south,
    east,
    north,
    west,
    onBoundsChange,
    tenant,
    tourId,
    overlayId,
    updateTourField,
    setFeedback,
    draggable,
  ]);

  // useEffect(() => {
  //   if (!rectangleRef.current || !map) return;
  //   rectangleRef.current.setOptions({ clickable: true, draggable });
  //   draggableRef.current = draggable;
  //   map.setOptions({ gestureHandling: draggable ? "none" : "auto" });
  // }, [draggable, map]);

  return <></>;
};

export default MapOverlayRectangle;
