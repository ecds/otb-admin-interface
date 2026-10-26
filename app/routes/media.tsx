import { useContext, useState } from "react";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
  type LoaderFunctionArgs,
} from "react-router";
import { Checkbox, Field, Label, Select } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import Pagination from "~/components/Pagination";
import ScrollableModal from "~/components/ScrollableModal";
import TextInput from "~/components/inputs/TextInput";
import SelectInput from "~/components/inputs/SelectInput";
import MissingAltTextBadge from "~/components/media_grid/MissingAltTextBadge";
import DecorativeBadge from "~/components/media_grid/DecorativeBadge";
import DeleteUnusedMedia from "~/components/media_grid/DeleteUnusedMedia";
import DeleteMedium from "~/components/media_grid/DeleteMedium";
import { needsAltText } from "~/utils/altText";
import { parseLinkHeader, type PaginationLinks } from "~/utils/linkHeader";
import { request as remoteRequest } from "~/utils/requests";
import type { TMedium } from "~/types";
import { TourSetContext } from "~/contexts";

const PER_PAGE = 20;

type LoaderData = {
  media: TMedium[];
  links: PaginationLinks;
  total: number;
  page: number;
  missingOnly: boolean;
  unusedOnly: boolean;
  // The tour being filtered to, if any.
  tourId?: string;
};

export const clientLoader = async ({
  request,
  params,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  const url = new URL(request.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1") || 1);
  const missingOnly = url.searchParams.get("missing_alt_text") === "true";
  const unusedOnly = url.searchParams.get("unused") === "true";
  const tourId = /^\d+$/.test(url.searchParams.get("tour_id") ?? "")
    ? url.searchParams.get("tour_id")!
    : undefined;

  const query = new URLSearchParams({
    page: `${page}`,
    per: `${PER_PAGE}`,
    ...(missingOnly && { missing_alt_text: "true" }),
    ...(unusedOnly && { unused: "true" }),
    ...(tourId && { tour_id: tourId }),
  });
  const { data, response, headers } = await remoteRequest({
    path: `${params.tourSet}/v4/admin/media?${query}`,
  });

  if (!response.ok || !Array.isArray(data))
    return {
      media: [],
      links: {},
      total: 0,
      page,
      missingOnly,
      unusedOnly,
      tourId,
    };

  return {
    media: data as TMedium[],
    links: parseLinkHeader(headers?.get("link") ?? "") ?? {},
    total: parseInt(headers?.get("x-total-count") ?? "") || data.length,
    page,
    missingOnly,
    unusedOnly,
    tourId,
  };
};

clientLoader.hydrate = true as const;

// All of a site's media, for finding and fixing images without alt text.
const MediaRoute = () => {
  const { media, links, total, page, missingOnly, unusedOnly, tourId } =
    useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidator = useRevalidator();
  const [editing, setEditing] = useState<TMedium | undefined>();
  const { tourSet } = useContext(TourSetContext);

  // The API sends no "last" link when everything fits on one page.
  const totalPages = links.last ? parseInt(links.last.page) : page;

  const goToPage = (next: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", `${next}`);
    setSearchParams(params);
  };

  // Changing a filter starts again from page 1.
  const updateFilters = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    params.delete("page");
    setSearchParams(params);
  };

  const setMissingOnly = (only: boolean) =>
    updateFilters({ missing_alt_text: only ? "true" : undefined });

  // An image in a tour is used, so the two filters don't combine.
  const setUnusedOnly = (only: boolean) =>
    updateFilters({
      unused: only ? "true" : undefined,
      tour_id: only ? undefined : tourId,
    });

  const setTour = (id: string) =>
    updateFilters({ tour_id: id === "0" ? undefined : id, unused: undefined });

  // Edits save straight away; reload so fixed images leave a filtered list.
  const closeEditor = () => {
    setEditing(undefined);
    revalidator.revalidate();
  };

  return (
    <div className="my-24 mx-auto w-11/12 max-w-6xl text-black/75">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-3xl">Media</h1>
        <p role="status">
          {total} {unusedOnly && "unused "}
          {total === 1 ? "image" : "images"}
          {missingOnly && (total === 1 ? " needs" : " need")}
          {missingOnly && " alt text"}
        </p>
        {tourSet && (
          <>
            <Select
              name="by-tour"
              aria-label="Filter by Tour"
              value={tourId ?? "0"}
              onChange={(event) => setTour(event.target.value)}
              className="border data-focus:bg-blue-100 data-hover:shadow"
            >
              <option value="0">All Tours</option>
              {tourSet.tours.map((tour) => {
                return (
                  <option key={`filter-${tour.id}`} value={tour.id}>
                    {tour.title}
                  </option>
                );
              })}
            </Select>{" "}
            <Field className="flex items-center gap-2">
              <Checkbox
                checked={missingOnly}
                onChange={setMissingOnly}
                className="group cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={missingOnly ? faSquareCheck : faSquare}
                  className="text-xl group-data-checked:text-blue-500"
                />
              </Checkbox>
              <Label className="cursor-pointer select-none">
                Only images missing alt text
              </Label>
            </Field>
            <Field className="flex items-center gap-2">
              <Checkbox
                checked={unusedOnly}
                onChange={setUnusedOnly}
                className="group cursor-pointer"
              >
                <FontAwesomeIcon
                  icon={unusedOnly ? faSquareCheck : faSquare}
                  className="text-xl group-data-checked:text-blue-500"
                />
              </Checkbox>
              <Label className="cursor-pointer select-none">
                Only unused images
              </Label>
            </Field>
          </>
        )}
      </div>

      {unusedOnly && total > 0 && tourSet && (
        <div className="my-4 flex justify-end">
          <DeleteUnusedMedia
            tenant={tourSet.subdir}
            count={total}
            // The deletions run in the background; check back shortly.
            onQueued={() => setTimeout(() => revalidator.revalidate(), 3000)}
          />
        </div>
      )}

      {media.length === 0 ? (
        <p className="my-16 text-center">
          {missingOnly
            ? "Every image here has alt text or is marked decorative."
            : unusedOnly
              ? "Every image is used in a tour or stop."
              : "No media yet."}
        </p>
      ) : (
        <ul className="my-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 list-none">
          {media.map((medium) => (
            <li key={medium.id}>
              <button
                type="button"
                onClick={() => setEditing(medium)}
                className="relative block w-full cursor-pointer rounded-md bg-gray-100 text-left hover:ring-2 hover:ring-blue-500"
              >
                {needsAltText(medium) && <MissingAltTextBadge />}
                {medium.decorative && <DecorativeBadge />}
                <img
                  src={medium.files.mobile}
                  alt={medium.alt_text ?? ""}
                  loading="lazy"
                  className="aspect-square w-full rounded-t-md object-cover"
                />
                <span className="block truncate px-2 py-1 text-sm">
                  {medium.title || medium.filename}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <Pagination
          links={links}
          current={page}
          setCurrent={goToPage}
          totalPages={totalPages}
        />
      )}

      {editing && tourSet && (
        <ScrollableModal
          isOpen
          setIsOpen={(open) => {
            if (!open) closeEditor();
          }}
          title={editing.title || editing.filename}
        >
          <img
            src={editing.files.tablet}
            alt={editing.alt_text ?? ""}
            className="mx-auto max-h-80"
          />
          <TextInput
            type="text-area"
            id="alt_text"
            label="Alt Text"
            model="medium"
            itemId={editing.id}
            tenant={tourSet.subdir}
            value={editing.alt_text ?? ""}
            helpText="Describe what the image shows for people using screen readers, in a sentence or two (at least 3 words). Don't repeat the caption or start with 'Image of'."
          />
          <SelectInput
            id="decorative"
            label="Image is decorative"
            model="medium"
            itemId={editing.id}
            tenant={tourSet.subdir}
            value={Boolean(editing.decorative)}
            helpText="Only for images that add nothing a screen reader user needs. Decorative images are published without a description."
          />
          <div className="me-3 flex justify-end gap-4">
            {/* Only images on the unused list can be deleted. */}
            {unusedOnly && (
              <DeleteMedium
                tenant={tourSet.subdir}
                medium={editing}
                onDeleted={closeEditor}
              />
            )}
            <button
              type="button"
              onClick={closeEditor}
              className="cursor-pointer rounded-md bg-blue-500 p-2 text-white"
            >
              Done
            </button>
          </div>
        </ScrollableModal>
      )}
    </div>
  );
};

export default MediaRoute;
