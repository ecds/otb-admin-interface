import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

interface Props {
  src: string | undefined;
  alt: string;
  className?: string;
  maxRetries?: number;
  // Explain why the image might be missing, for places with room for it.
  explain?: boolean;
}

// New uploads and embed thumbnails are processed by the API after the medium
// is created, so the image URL can 404 for a while. Retry with backoff (1s,
// 2s, 4s, ...) instead of refetching the tour, then offer to try again.
const RetryingImage = ({
  src,
  alt,
  className,
  maxRetries = 5,
  explain = false,
}: Props) => {
  const [attempt, setAttempt] = useState<number>(0);
  // The attempt the current round of retries started from.
  const [roundStart, setRoundStart] = useState<number>(0);
  const [failed, setFailed] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setAttempt(0);
    setRoundStart(0);
    setFailed(false);
    return () => clearTimeout(timer.current);
  }, [src]);

  const tryAgain = () => {
    setRoundStart(attempt + 1);
    setAttempt(attempt + 1);
    setFailed(false);
  };

  if (!src || failed) {
    return (
      <div
        className={`${className ?? ""} flex flex-col items-center justify-center gap-2 p-4 text-center text-sm text-black/60`}
      >
        <p>{src ? "This image isn't ready yet." : "Processing image…"}</p>
        {src && explain && (
          <p>
            New images are resized after they upload, which can take a minute or
            two for large files. You can add alt text and a caption while you
            wait.
          </p>
        )}
        {src && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              tryAgain();
            }}
            // Keeps a click here from starting a drag in the media grid.
            onPointerDown={(event) => event.stopPropagation()}
            onKeyUp={(event) => event.stopPropagation()}
            className="cursor-pointer rounded-sm bg-black/70 px-2 py-1 text-white hover:bg-black"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  const handleError = () => {
    const retries = attempt - roundStart;
    if (retries >= maxRetries) {
      setFailed(true);
      return;
    }
    timer.current = setTimeout(
      () => setAttempt((n) => n + 1),
      1000 * 2 ** retries,
    );
  };

  const url =
    attempt === 0
      ? src
      : `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}`;

  return (
    <>
      <img
        src={url}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        // Covers the nearest positioned parent, so callers give it one.
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-gray-200 text-sm text-black/60">
          <p>
            <FontAwesomeIcon icon={faSpinner} spin /> Loading…
          </p>
        </div>
      )}
    </>
  );
};

export default RetryingImage;
