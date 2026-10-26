import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Shown on a thumbnail marked decorative, so the choice gets a second look.
// Quieter than the missing alt text badge: it's allowed, just worth checking.
const DecorativeBadge = ({ className = "" }: { className?: string }) => (
  <span
    className={`absolute top-2 left-2 z-10 rounded-full bg-gray-700 px-2 py-0.5 text-xs font-semibold text-white shadow ${className}`}
  >
    <FontAwesomeIcon icon={faEyeSlash} aria-hidden="true" /> Decorative
  </span>
);

export default DecorativeBadge;
