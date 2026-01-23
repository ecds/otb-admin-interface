import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { OverlayContext, RecordContext } from "~/contexts";
import { debounce } from "~/utils/debounce";
import { sendUpdate } from "~/utils/requests";

const MapOverlay = () => {
  const { tenant, tour } = useContext(RecordContext);
  const { south, north, east, west, setSouth, setNorth, setEast, setWest } =
    useContext(OverlayContext);
  const map = useMap();

  useEffect(() => {
    if (!tour) return;
    const worldBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-85, -180),
      new google.maps.LatLng(85, 180)
    );

    const mask = new google.maps.GroundOverlay("/blank.jpg", worldBounds);
    if (tour.blank_map) {
      mask.setMap(map);
    }

    return () => {
      mask.setMap(null);
    };
  }, [tour, map]);

  useEffect(() => {
    if (!map || !tour || !tour.map_overlay) return;
    if (!south || !north || !east || !west) return;

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(south, west),
      new google.maps.LatLng(north, east)
    );

    const overlay = new google.maps.GroundOverlay(
      tour.map_overlay.image_url,
      bounds
    );

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [tour, tenant, map, south, north, east, west]);

  const handleDratStart = debounce(
    (
      event: google.maps.MapMouseEvent,
      corner: "Southeast" | "Northeast" | "Southwest" | "Northwest"
    ) => {
      const lat = event.latLng?.lat();
      const lng = event.latLng?.lng();
      if (!lat || !lng) return;
      switch (corner) {
        case "Southeast":
          setSouth(lat);
          setEast(lng);
          if (tour && tour.map_overlay) tour.map_overlay.south = lat;
          break;
        case "Northeast":
          setNorth(event.latLng?.lat());
          setEast(event.latLng?.lng());
          break;
        case "Northwest":
          setNorth(event.latLng?.lat());
          setWest(event.latLng?.lng());
          break;
        case "Southwest":
          setSouth(event.latLng?.lat());
          setWest(event.latLng?.lng());
          break;
        default:
          break;
      }
    },
    100
  );

  // TODO: Updating the inputs should be enough but it is not using the correct id.
  // it's using the tour ID, not the overlay ID.
  const handleDragEnd = async () => {
    if (!tour) return;
    if (!south || !north || !east || !west) return;

    const cardinals = { south, north, east, west };

    for (const [key, value] of Object.entries(cardinals)) {
      await sendUpdate({
        tenant: tour?.tenant,
        record: tour.map_overlay.id,
        body: {
          attribute: key,
          model: "map_overlay",
          value,
        },
      });
    }
  };

  if (!tour || !tour.map_overlay || !south || !north || !east || !west)
    return <></>;

  return (
    <>
      <AdvancedMarker
        position={{ lat: south, lng: east }}
        draggable
        onDrag={(event) => handleDratStart(event, "Southeast")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <div className="h-8 w-8 bg-pink-500 rounded-full"></div>
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: north, lng: east }}
        draggable
        onDrag={(event) => handleDratStart(event, "Northeast")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <div className="h-8 w-8 bg-pink-500 rounded-full"></div>
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: south, lng: west }}
        draggable
        onDrag={(event) => handleDratStart(event, "Southwest")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <div className="h-8 w-8 bg-pink-500 rounded-full"></div>
      </AdvancedMarker>
      <AdvancedMarker
        position={{ lat: north, lng: west }}
        draggable
        onDrag={(event) => handleDratStart(event, "Northwest")}
        onDragEnd={handleDragEnd}
        anchorLeft="-1rem"
        anchorTop="-1rem"
      >
        <div className="h-8 w-8 bg-pink-500 rounded-full"></div>
      </AdvancedMarker>
    </>
  );
};

export default MapOverlay;
