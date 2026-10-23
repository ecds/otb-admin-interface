import { useTourStore } from "~/store/tourStore";
import TextInput from "../inputs/TextInput";
import MapIconControls from "./MapIconControls";
import PreviouslyUsed from "./PreviouslyUsed";

const MarkerStyle = ({ stopId }: { stopId: number }) => {
  const stop = useTourStore((s) =>
    s.tour?.stops.find((st) => st.id === stopId),
  );
  const setStopMapIcon = useTourStore((s) => s.setStopMapIcon);

  if (!stop) return null;

  // Icon color and icon live on the tour stop (per tour). The color goes
  // out with the stop's entry in the tour save; the icon saves against the
  // join record's relation_id.
  return (
    <div className="flex flex-col gap-4 my-4">
      {!stop.map_icon && (
        <div className="flex flex-col md:flex-row">
          <TextInput
            itemId={stop.id}
            label="Icon Color"
            type="color"
            value={stop.icon_color ?? "#D32F2F"}
            model="stop"
            id="icon_color"
            helpText="Select a color for the map maker. Be sure to pick a color that is easily seen on the map and the stop number is readable."
          />
          <PreviouslyUsed stopId={stop.id} />
        </div>
      )}
      <div className="">
        <MapIconControls
          target={{ model: "tour_stop", recordId: stop.relation_id }}
          hasIcon={Boolean(stop.map_icon_custom)}
          onChange={(url) => setStopMapIcon(stopId, url)}
          removeLabel="Remove Custom Icon"
          removeHelp="Removes this stop's own icon. It will use the tour's icon, if the tour has one."
          uploadHelp="Upload a custom icon for this stop in this tour. The file must be an image (jpeg, png, or webp) and no larger than 80 by 80 pixels. Once uploaded, the icon can be reused with “Use Existing Icon”."
        />
      </div>
    </div>
  );
};

export default MarkerStyle;
