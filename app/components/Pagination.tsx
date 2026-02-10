import {
  faBackwardStep,
  faCaretLeft,
  faCaretRight,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Dispatch, SetStateAction } from "react";
import type { PaginationLinks } from "~/utils/linkHeader";

interface Props {
  links: PaginationLinks;
  current: number;
  setCurrent: Dispatch<SetStateAction<number>>;
}

const Pagination = ({ links, current, setCurrent }: Props) => {
  const { first, prev, next, last } = links;

  return (
    <nav
      aria-label="Page navigation example"
      className="flex gap-4 justify-center"
    >
      <button
        disabled={!first}
        onClick={() => setCurrent(parseInt(first?.page ?? ""))}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faBackwardStep} />{" "}
        <span className="sr-only">First</span>
      </button>
      <button
        disabled={!prev}
        onClick={() => setCurrent(parseInt(prev?.page ?? ""))}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faCaretLeft} />{" "}
        <span className="sr-only">Previous</span>
      </button>
      <div>{current}</div>
      <button
        disabled={!next}
        onClick={() => setCurrent(parseInt(next?.page ?? ""))}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faCaretRight} />{" "}
        <span className="sr-only">Previous</span>
      </button>
      <button
        disabled={!last}
        onClick={() => setCurrent(parseInt(last?.page ?? ""))}
        className="disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faForwardStep} />{" "}
        <span className="sr-only">Last</span>
      </button>
    </nav>
  );
};

export default Pagination;
