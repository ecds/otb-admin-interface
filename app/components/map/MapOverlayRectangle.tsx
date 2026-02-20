import { useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect, useRef } from "react";
import { OverlayContext, TourContext } from "~/contexts";
import { debounce } from "~/utils/debounce";
import { sendUpdate } from "~/utils/requests";

const MapOverlayRectangle = () => {
  const map = useMap();
  const { tour, setIsSaving } = useContext(TourContext);
  const {
    south,
    north,
    east,
    west,
    setSouth,
    setNorth,
    setEast,
    setWest,
    draggable,
  } = useContext(OverlayContext);
  const rectangleRef = useRef<google.maps.Rectangle | undefined>(undefined);

  useEffect(() => {
    if (!map) return;
    if (!south || !north || !east || !west) return;

    const handleDrag = debounce(async () => {
      if (!rectangleRef.current) return;
      const newBounds = rectangleRef.current.getBounds();
      if (!newBounds) return;

      setIsSaving(true);
      if (setSouth) setSouth(newBounds.getSouthWest().lat());
      if (setWest) setWest(newBounds.getSouthWest().lng());
      if (setNorth) setNorth(newBounds.getNorthEast().lat());
      if (setEast) setEast(newBounds.getNorthEast().lng());

      await sendUpdate({
        tenant: tour.tenant,
        record: tour.map_overlay.id,
        body: {
          model: "map_overlay",
          map_overlay: {
            south: newBounds.getSouthWest().lat(),
            west: newBounds.getSouthWest().lng(),
            north: newBounds.getNorthEast().lat(),
            east: newBounds.getNorthEast().lng(),
          },
          reindex: {
            id: tour.id,
            model: "tour",
          },
        },
      });

      setIsSaving(false);
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
    });

    console.log(
      "🚀 ~ MapOverlayRectangle ~ rectangleRef.current:",
      rectangleRef.current,
    );

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
    setSouth,
    setWest,
    setNorth,
    setEast,
    tour,
    setIsSaving,
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
