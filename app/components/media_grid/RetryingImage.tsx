import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

interface Props {
  src: string | undefined;
  alt: string;
  className?: string;
  maxRetries?: number;
}

// Embed thumbnails are fetched by the API after the medium is created, so the
// image URL can 404 for a while. Retry with backoff (1s, 2s, 4s, ...) instead
// of refetching the tour.
const RetryingImage = ({ src, alt, className, maxRetries = 5 }: Props) => {
  const [attempt, setAttempt] = useState<number>(0);
  const [failed, setFailed] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setAttempt(0);
    setFailed(false);
    return () => clearTimeout(timer.current);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`${className ?? ""} flex items-center justify-center text-sm text-black/60`}
      >
        Processing image…
      </div>
    );
  }

  const handleError = () => {
    if (attempt >= maxRetries) {
      setFailed(true);
      return;
    }
    timer.current = setTimeout(
      () => setAttempt((n) => n + 1),
      1000 * 2 ** attempt,
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
        <div
          ref={progressBarRef}
          className="text-white absolute z-10 bg-black h-full w-full flex flex-col justify-center items-center"
        >
          <p>
            <FontAwesomeIcon icon={faSpinner} spin /> loading
          </p>
        </div>
      )}
    </>
  );
};

export default RetryingImage;
