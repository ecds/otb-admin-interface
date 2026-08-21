import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { safeId } from "~/utils/a11y";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const ToolTip = ({ children }: Props) => {
  const id = safeId();
  return (
    <div className="relative group inline">
      <button aria-describedby={id} className="drop-shadow-2xl cursor-help">
        <FontAwesomeIcon
          icon={faCircleQuestion}
          className="text-lg text-blue-500"
        />
      </button>
      <div
        id={id}
        role="tooltip"
        className="absolute left-full min-w-md max-w-xl transform -translate-y-1/2 top-1/2 mb-2 hidden group-hover:block bg-black/75 text-white rounded py-1 px-2 z-10 transition-opacity duration-1000 opacity-0 group-hover:opacity-100"
      >
        {children}
      </div>
    </div>
  );
};

export default ToolTip;
