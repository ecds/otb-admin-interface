import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { useTourStore } from "~/store/tourStore";

// The API leaves the number off when there's no time, e.g. " walking".
const hasTime = (words?: string) =>
  (words?.trim().split(/\s+/).length ?? 0) > 1;

// The published tour's estimated time, and, in red, why parts of it couldn't
// be worked out. Times are only calculated for published tours.
const TourTime = () => {
  const saved = useTourStore((s) => s.saved);
  if (!saved?.published) return null;

  const problems = saved.duration_problems ?? [];
  const times = [saved.travel_duration, saved.read_duration].filter(hasTime);

  return (
    <div className="mb-8 space-y-2">
      {times.length > 0 && (
        <p className="text-black/75">
          <span className="font-medium">Estimated time:</span>{" "}
          {times.join(" and ")}
        </p>
      )}
      {problems.length > 0 && (
        <div
          role="alert"
          className="rounded-md border border-red-700 bg-red-50 p-4 text-red-900"
        >
          <p className="font-semibold">
            <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" />{" "}
            The tour&apos;s travel time couldn&apos;t be fully worked out
          </p>
          <ul className="mt-2 list-disc ps-6">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TourTime;
