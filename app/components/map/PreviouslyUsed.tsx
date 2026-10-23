import { faMapMarker } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTourStore } from "~/store/tourStore";

const PreviouslyUsed = ({ stopId }: { stopId?: number }) => {
  const tour = useTourStore((s) => s.tour);
  const updateStopField = useTourStore((s) => s.updateStopField);
  const updateTourField = useTourStore((s) => s.updateTourField);

  const colors = () => {
    if (!tour) return [];

    return Array.from(
      new Set([tour.icon_color, ...tour.stops.map((s) => s.icon_color)]),
    );
  };

  const handleClick = (color: string) => {
    if (stopId) {
      updateStopField(stopId, "icon_color", color);
    } else {
      updateTourField("icon_color", color);
    }
  };

  if (colors().length <= 1 || !tour) return <></>;

  return (
    <div>
      <div className="mb-2">Previously Used</div>
      <div className="flex flex-wrap space-x-2">
        {Array.from(
          new Set([tour.icon_color, ...tour.stops.map((s) => s.icon_color)]),
        ).map((color) => {
          return (
            <button
              key={color}
              style={{
                color,
              }}
              className="text-2xl"
              onClick={() => handleClick(color)}
            >
              <FontAwesomeIcon icon={faMapMarker} />
              <span className="sr-only">{tour.icon_color ?? "#D32F2F"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PreviouslyUsed;
