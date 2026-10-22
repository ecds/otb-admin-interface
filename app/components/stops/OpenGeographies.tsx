import { useState } from "react";
import { Description, Field, Input, Label } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTourStore } from "~/store/tourStore";
import { fetchOpenGeographiesPreview } from "~/utils/openGeographies";
import ToolTip from "../inputs/ToolTip";
import OpenGeographiesStops from "./OpenGeographiesStops";
import type { TOpenGeographiesPreview } from "~/types";

type Check =
  | { status: "idle" | "checking" }
  | { status: "ok"; url: string; preview: TOpenGeographiesPreview }
  | { status: "error"; url: string; error: string };

const buttonClass =
  "cursor-pointer rounded-sm px-2 py-1 drop-shadow-md disabled:cursor-default disabled:opacity-50";

// The tour's Open Geographies source. A URL is checked before it's saved,
// so autosave never stores one that can't be read.
const OpenGeographies = () => {
  const tourId = useTourStore((s) => s.tour?.id);
  const tenant = useTourStore((s) => s.tour?.tenant);
  const saved = useTourStore((s) => s.saved?.open_geographies_endpoint ?? "");
  const updateTourField = useTourStore((s) => s.updateTourField);
  const [draft, setDraft] = useState(saved);
  const [check, setCheck] = useState<Check>({ status: "idle" });

  if (!tourId || !tenant) return <></>;

  const url = draft.trim();
  const checkedThisUrl = check.status === "ok" && check.url === url;

  const runCheck = async () => {
    if (!url) return;
    setCheck({ status: "checking" });
    const result = await fetchOpenGeographiesPreview(tenant, tourId, true, url);
    setCheck(
      result.ok
        ? { status: "ok", url, preview: result.preview }
        : { status: "error", url, error: result.error },
    );
  };

  const useSource = () => {
    if (!checkedThisUrl) return;
    updateTourField("open_geographies_endpoint", url);
    setCheck({ status: "idle" });
  };

  const removeSource = () => {
    updateTourField("open_geographies_endpoint", "");
    setDraft("");
    setCheck({ status: "idle" });
  };

  return (
    <div className="my-8">
      <Field>
        <div className="flex items-center gap-3">
          <Label className="font-medium text-black/75">
            Open Geographies Tour
          </Label>
          <Description as="div">
            <ToolTip>
              The address of an Open Geographies tour. Check it first; once
              it&apos;s used, this tour&apos;s stops come from Open Geographies
              and are shown below. They&apos;re edited in Open Geographies.
            </ToolTip>
          </Description>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            type="url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void runCheck();
            }}
            placeholder="https://…"
            className="grow rounded-md border border-gray-300 px-4 py-3.5 shadow-xs"
          />
          <button
            type="button"
            onClick={() => void runCheck()}
            disabled={!url || check.status === "checking"}
            className={`${buttonClass} bg-black/70 text-white hover:bg-black`}
          >
            {check.status === "checking" ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              "Check"
            )}
          </button>
          {saved && (
            <button
              type="button"
              onClick={removeSource}
              className={`${buttonClass} text-red-600 hover:underline`}
            >
              Remove source
            </button>
          )}
        </div>
      </Field>

      {check.status === "error" && check.url === url && (
        <p role="alert" className="mt-2 text-red-700">
          {check.error}
        </p>
      )}

      {checkedThisUrl && (
        <div className="mt-3 rounded-md bg-gray-100 p-4" role="status">
          <p>
            Found {check.preview.stop_count}{" "}
            {check.preview.stop_count === 1 ? "stop" : "stops"}
            {check.preview.problems.length > 0 &&
              `, with ${check.preview.problems.length} ${
                check.preview.problems.length === 1 ? "thing" : "things"
              } to check`}
            .
          </p>
          {url !== saved && (
            <button
              type="button"
              onClick={useSource}
              className={`${buttonClass} mt-3 bg-blue-500 text-white hover:bg-blue-300 hover:text-black`}
            >
              Use this source
            </button>
          )}
        </div>
      )}

      <OpenGeographiesStops />
    </div>
  );
};

export default OpenGeographies;
