import { useMap } from "@vis.gl/react-google-maps";
import { useContext, useEffect } from "react";
import { OverlayContext, TourContext } from "~/contexts";

// Usage
// const map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
//   center: { lat: 40.7128, lng: -74.006 },
//   zoom: 12,
// });

// const bounds = new google.maps.LatLngBounds(
//   new google.maps.LatLng(40.7, -74.02),
//   new google.maps.LatLng(40.72, -74.0),
// );

// const overlay = new DraggableGroundOverlay(
//   bounds,
//   "path/to/your/image.png",
//   map,
// );

const MapOverlay = ({ editable = true }: { editable?: boolean }) => {
  const { tour } = useContext(TourContext);
  const { south, north, east, west } = useContext(OverlayContext);
  const map = useMap();

  useEffect(() => {
    if (!map || !tour.map_overlay) return;
    if (!south || !north || !east || !west) return;

    class DraggableGroundOverlay extends google.maps.OverlayView {
      private bounds_: google.maps.LatLngBounds;
      private image_: string;
      private div_: HTMLDivElement | null = null;

      constructor(bounds: google.maps.LatLngBounds, image: string) {
        super();
        this.bounds_ = bounds;
        this.image_ = image;
      }

      onAdd(): void {
        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.cursor = "move";

        const img = document.createElement("img");
        img.src = this.image_;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.position = "absolute";
        div.appendChild(img);

        this.div_ = div;

        // Add drag functionality
        // this.addDragListeners();

        const panes = this.getPanes();
        if (panes) {
          // @ts-expect-error: overlayImage is too a pane!
          panes.overlayImage.appendChild(div);
        }
      }

      draw(): void {
        const overlayProjection = this.getProjection();
        const sw = overlayProjection.fromLatLngToDivPixel(
          this.bounds_.getSouthWest(),
        );
        const ne = overlayProjection.fromLatLngToDivPixel(
          this.bounds_.getNorthEast(),
        );

        if (this.div_ && sw && ne) {
          this.div_.style.left = sw.x + "px";
          this.div_.style.top = ne.y + "px";
          this.div_.style.width = ne.x - sw.x + "px";
          this.div_.style.height = sw.y - ne.y + "px";
        }
      }

      // private addDragListeners(): void {
      //   let isDragging = false;
      //   let startX: number;
      //   let startY: number;
      //   let startBounds: google.maps.LatLngBounds;

      //   if (!this.div_) return;

      //   this.div_.addEventListener("mousedown", (e: MouseEvent) => {
      //     isDragging = true;
      //     startX = e.clientX;
      //     startY = e.clientY;
      //     startBounds = this.bounds_;
      //     e.preventDefault();
      //   });

      //   document.addEventListener("mousemove", (e: MouseEvent) => {
      //     if (!isDragging) return;

      //     const dx = e.clientX - startX;
      //     const dy = e.clientY - startY;

      //     const projection = this.getProjection();
      //     const sw = projection.fromLatLngToDivPixel(
      //       startBounds.getSouthWest(),
      //     );
      //     const ne = projection.fromLatLngToDivPixel(
      //       startBounds.getNorthEast(),
      //     );

      //     if (sw && ne) {
      //       const newSW = projection.fromDivPixelToLatLng(
      //         new google.maps.Point(sw.x + dx, sw.y + dy),
      //       );
      //       const newNE = projection.fromDivPixelToLatLng(
      //         new google.maps.Point(ne.x + dx, ne.y + dy),
      //       );

      //       if (newSW && newNE) {
      //         this.bounds_ = new google.maps.LatLngBounds(newSW, newNE);
      //         this.draw();
      //       }
      //     }
      //   });

      //   document.addEventListener("mouseup", () => {
      //     isDragging = false;
      //   });
      // }

      onRemove(): void {
        if (this.div_ && this.div_.parentNode) {
          this.div_.parentNode.removeChild(this.div_);
          this.div_ = null;
        }
      }

      getBounds(): google.maps.LatLngBounds {
        return this.bounds_;
      }

      setBounds(bounds: google.maps.LatLngBounds): void {
        this.bounds_ = bounds;
        this.draw();
      }
    }

    const worldBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-80, -180),
      new google.maps.LatLng(80, 180),
    );

    const mask = new google.maps.Rectangle({
      bounds: worldBounds,
      fillColor: "darkgray",
      fillOpacity: 1,
      zIndex: 1,
    });

    if (tour.blank_map) mask.setMap(map);

    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(south, west),
      new google.maps.LatLng(north, east),
    );

    const overlay = new DraggableGroundOverlay(
      bounds,
      tour.map_overlay.image_url,
    );

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
      mask.setMap(null);
    };
  }, [map, tour, south, north, east, west]);

  // useEffect(() => {
  //   if (!map) return;
  //   const worldBounds = new google.maps.LatLngBounds(
  //     new google.maps.LatLng(-85, -180),
  //     new google.maps.LatLng(85, 180),
  //   );

  //   const mask = new google.maps.GroundOverlay("/admin/blank.jpg", worldBounds);

  //   // Pass the click event through to the map
  //   const listener = mask.addListener(
  //     "click",
  //     (event: google.maps.MapMouseEvent) =>
  //       google.maps.event.trigger(map, "click", event),
  //   );
  //   if (tour.blank_map) {
  //     mask.setMap(map);
  //   }

  //   return () => {
  //     google.maps.event.removeListener(listener);
  //     mask.setMap(null);
  //   };
  // }, [tour, map]);

  // useEffect(() => {
  //   if (!map || !tour.map_overlay) return;
  //   if (!south || !north || !east || !west) return;

  //   const bounds = new google.maps.LatLngBounds(
  //     new google.maps.LatLng(south, west),
  //     new google.maps.LatLng(north, east),
  //   );

  //   const overlay = new google.maps.GroundOverlay(
  //     tour.map_overlay.image_url,
  //     bounds,
  //   );

  //   // Pass the click event through to the map
  //   const listener = overlay.addListener(
  //     "click",
  //     (event: google.maps.MapMouseEvent) =>
  //       google.maps.event.trigger(map, "click", event),
  //   );

  //   overlay.setMap(map);
  //   const mapBounds = map.getBounds();
  //   if (mapBounds) {
  //     map.fitBounds(mapBounds.extend(new google.maps.LatLng(south, west)));
  //     map.fitBounds(mapBounds.extend(new google.maps.LatLng(north, east)));
  //   }

  //   return () => {
  //     google.maps.event.removeListener(listener);
  //     overlay.setMap(null);
  //   };
  // }, [tour, map, south, north, east, west]);

  if (!tour.map_overlay || !south || !north || !east || !west || !editable)
    return <></>;

  return <></>;
};

export default MapOverlay;
