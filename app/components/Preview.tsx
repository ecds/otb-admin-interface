import { faDesktop, faMobile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useRef } from "react";
import { TourContext } from "~/contexts";

const Preview = () => {
  const { tour } = useContext(TourContext);
  // const [previewDesktop, setPreviewDesktop] = useState<boolean>(false);
  // const [previewMobile, setPreviewMobile] = useState<boolean>(false);
  const desktopWindowRef = useRef<WindowProxy>(null);
  const mobileWindowRef = useRef<WindowProxy>(null);

  useEffect(() => {
    if (desktopWindowRef.current && !desktopWindowRef.current.closed) {
      desktopWindowRef.current.location.reload();
    }
    if (mobileWindowRef.current && !mobileWindowRef.current.closed) {
      mobileWindowRef.current.location.reload();
    }
  }, [tour]);

  const previewDesktop = () => {
    if (!desktopWindowRef.current || desktopWindowRef.current.closed) {
      desktopWindowRef.current = window.open(
        `https://${tour.tenant}.opentour.site/${tour.slug}`,
        "desktopWindow",
        `width=${window.innerWidth}, height=${window.innerHeight}`,
      );
    } else {
      desktopWindowRef.current.focus();
    }
  };

  const previewMobile = () => {
    if (!mobileWindowRef.current || mobileWindowRef.current.closed) {
      mobileWindowRef.current = window.open(
        `https://${tour.tenant}.opentour.site/${tour.slug}`,
        "mobileWindow",
        "width=410, height=730, resizable=no",
      );
    } else {
      mobileWindowRef.current.focus();
    }
  };

  return (
    <div className="fixed z-50 h-16 bg-gray-300 w-full bottom-0 flex justify-end items-center gap-8 pe-8">
      <button
        className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg capitalize"
        onClick={previewMobile}
      >
        <FontAwesomeIcon icon={faMobile} /> preview mobile
      </button>
      <button
        className="text-white hover:text-black h-8 px-2 py-1 rounded-sm file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer drop-shadow-lg capitalize"
        onClick={previewDesktop}
      >
        <FontAwesomeIcon icon={faDesktop} /> preview desktop
      </button>
    </div>
  );
};

export default Preview;
