import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

// Shown on a thumbnail whose image has no alt text and isn't decorative.
const MissingAltTextBadge = ({ className = "" }: { className?: string }) => (
  <span
    className={`absolute top-2 left-2 z-10 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-black shadow ${className}`}
  >
    <FontAwesomeIcon icon={faTriangleExclamation} aria-hidden="true" /> No alt
    text
  </span>
);

export default MissingAltTextBadge;
