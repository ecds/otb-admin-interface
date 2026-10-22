import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useOpenGeographiesPreview } from "~/hooks/useOpenGeographiesPreview";

// Read-only view of the stops a tour gets from Open Geographies, so a
// curator can check them. The stops themselves are edited in Open
// Geographies.
const OpenGeographiesStops = () => {
  const { endpoint, status, preview, error, refresh } =
    useOpenGeographiesPreview();

  if (!endpoint) return null;

  return (
    <section aria-labelledby="og-stops-heading" className="my-8">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 id="og-stops-heading" className="text-2xl">
          Stops from Open Geographies
        </h2>
        {preview && (
          <span className="text-black/60">
            {preview.stop_count} {preview.stop_count === 1 ? "stop" : "stops"}
            {" · "}
            checked {new Date(preview.fetched_at).toLocaleString()}
          </span>
        )}
        <button
          type="button"
          onClick={refresh}
          disabled={status === "loading"}
          className="ms-auto cursor-pointer bg-black/70 hover:bg-black text-white rounded-sm px-2 py-1 drop-shadow-md disabled:opacity-50 disabled:cursor-wait"
        >
          <FontAwesomeIcon icon={faArrowsRotate} spin={status === "loading"} />{" "}
          Refresh
        </button>
      </div>

      <p className="mt-2 text-black/75">
        These stops are managed in{" "}
        <a
          href={endpoint}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-900"
        >
          Open Geographies
        </a>{" "}
        and can&apos;t be edited here. Any stops added to this tour directly are
        hidden while an Open Geographies source is set.
      </p>

      {status === "error" && (
        <div
          role="alert"
          className="mt-4 rounded-md bg-red-50 p-4 text-red-800"
        >
          {error}
        </div>
      )}

      {preview && preview.problems.length > 0 && (
        <div className="mt-4 rounded-md bg-amber-50 p-4 text-amber-900">
          <p className="font-semibold">
            <FontAwesomeIcon icon={faTriangleExclamation} /> Check these in Open
            Geographies
          </p>
          <ul className="mt-2 list-disc ps-6">
            {preview.problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        </div>
      )}

      {!preview && status === "loading" && (
        <p className="mt-4 text-black/60">Loading stops…</p>
      )}

      {preview && preview.stops.length > 0 && (
        <div className="mt-6">
          {preview.stops.map((stop) => (
            <details
              key={stop.id}
              name="og-stops"
              className="my-4 rounded-md bg-gray-200 p-3"
            >
              <summary className="cursor-pointer text-lg font-semibold">
                {stop.position}: {stop.title}
              </summary>
              <div className="mt-4 space-y-4 rounded-md bg-white p-4 text-black/75">
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
                  {stop.address && (
                    <>
                      <dt className="font-medium">Address</dt>
                      <dd>{stop.address}</dd>
                    </>
                  )}
                  <dt className="font-medium">Location</dt>
                  <dd>
                    {stop.lat}, {stop.lng}
                  </dd>
                </dl>
                {stop.meta_description && (
                  <p className="italic">{stop.meta_description}</p>
                )}
                {stop.description_html && (
                  <div
                    className="[&_p]:mb-4 [&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6"
                    // Cleaned by the API's allow-list sanitizer.
                    dangerouslySetInnerHTML={{
                      __html: stop.description_html,
                    }}
                  />
                )}
                {stop.media.length > 0 && (
                  <ul className="flex flex-wrap gap-4">
                    {stop.media.map((medium, index) => (
                      <li
                        key={`${medium.files.mobile}-${index}`}
                        className="list-none"
                      >
                        {medium.files.mobile ? (
                          <img
                            src={medium.files.mobile}
                            alt={medium.title ?? ""}
                            loading="lazy"
                            className="h-32 w-32 rounded-md object-cover"
                          />
                        ) : (
                          <span className="flex h-32 w-32 items-center justify-center rounded-md bg-gray-100 p-2 text-center text-sm">
                            {medium.title ?? "Media"}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
};

export default OpenGeographiesStops;
