import { faDesktop, faMobile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef } from "react";
import { useTourStore } from "~/store/tourStore";

const Preview = () => {
  const tenant = useTourStore((s) => s.tour?.tenant);
  const slug = useTourStore((s) => s.tour?.slug);
  const lastSaved = useTourStore((s) => s.lastSaved);
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
  }, [lastSaved]);

  const previewDesktop = () => {
    if (!desktopWindowRef.current || desktopWindowRef.current.closed) {
      desktopWindowRef.current = window.open(
        `https://${tenant}.opentour.site/${slug}`,
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
        `https://${tenant}.opentour.site/${slug}`,
        "mobileWindow",
        "width=410, height=730, resizable=no",
      );
    } else {
      mobileWindowRef.current.focus();
    }
  };

  return (
    <>
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
    </>
  );
};

export default Preview;
