import { useParams } from "react-router";
import { useTourQuery } from "~/hooks/useTourQuery";
import { useTourStore } from "~/store/tourStore";
import TextInput from "~/components/inputs/TextInput";
import SelectInput from "~/components/inputs/SelectInput";
import { languages } from "~/choices";
import { Fieldset, Legend } from "@headlessui/react";
import ToolTip from "~/components/inputs/ToolTip";
import ThemeSelector from "~/components/ThemeSelector";
import MediaGrid from "~/components/media_grid/MediaGrid";
import MapControls from "~/components/MapControls";
import { APIProvider } from "@vis.gl/react-google-maps";
import StopsList from "~/components/stops/StopsList";
import FlatPageList from "~/components/flat_pages/FlatPageList";
import Preview from "~/components/Preview";
import TravelModes from "~/components/TravelModes";
import SaveButton from "~/components/buttons/SaveButton";
import VoiceOverUpload from "~/components/voice_overs/VoiceOverUpload";
import VoiceOverList from "~/components/voice_overs/VoiceOverList";
import TourAuthors from "~/components/TourAuthors";
import type { TTravelMode } from "~/types";

const TourRoute = () => {
  const { tourSet, tour_id } = useParams<{
    tourSet: string;
    tour_id: string;
  }>();

  const { data, status } = useTourQuery(tourSet!, tour_id!);
  const tour = useTourStore((s) => s.tour);

  if (status === "pending") {
    return (
      <div className="my-24 flex justify-center text-black/75">Loading…</div>
    );
  }

  if (status === "error") {
    return (
      <div className="my-24 flex flex-col items-center space-y-4 text-black/75">
        <p className="text-2xl">This tour could not be found.</p>
        <p>It may have been deleted, or the link may be incorrect.</p>
        {tourSet && (
          <a
            href={`/admin/${tourSet}`}
            className="bg-blue-500 hover:bg-blue-800 text-white px-2 py-1 rounded-md drop-shadow-2xl uppercase font-light tracking-wide"
          >
            Back to tours
          </a>
        )}
      </div>
    );
  }

  // useTourQuery syncs into the store after render; until then the store may
  // be empty or still hold the previous tour.
  if (!tour || tour.id !== data?.tour.id) return null;

  const modes: TTravelMode[] = data?.modes ?? [];

  return (
    <>
      <div className="my-24 px-8 md:px-0 xl:px-12 mx-auto max-full md:max-w-10/12 text-black/75">
        <TourAuthors />
        <TextInput
          itemId={tour.id}
          type="text"
          label="Tour Title"
          value={tour.title}
          id="title"
          model="tour"
        />
        <div className="flex flex-row">
          <SelectInput
            itemId={tour.id}
            label="Published"
            value={tour.published}
            id="published"
            model="tour"
            helpText="Toggle to make tour publicly available."
          />
          {tour.published_on && (
            <p>
              <span className="">Published On:</span> {tour.published_on}
            </p>
          )}
        </div>
        <TextInput
          itemId={tour.id}
          type="rich-text"
          label="Description"
          value={tour.description}
          id="description"
          model="tour"
        />
        <VoiceOverUpload tour_id={tour.id} />
        <VoiceOverList />
        <TextInput
          itemId={tour.id}
          type="text-area"
          label="Tour Meta Description"
          value={tour.meta_description}
          model="tour"
          id="meta_description"
          helpText="The Meta Description shows up as a text description when the link is shared on social media. Keep it clean of special characters."
        />
        <SelectInput
          itemId={tour.id}
          label="Select Default Language"
          options={languages}
          value={tour.default_lng}
          model="tour"
          id="default_lng"
          helpText="Select the language for the content. This will be used when a person has their device read the content. Please let us know if you would like a language added!"
        />
        <Fieldset className="space-y-8">
          <Legend className="text-2xl flex space-x-3">
            <div>External Link</div>
            <ToolTip>
              Link that will display along with the pages. This allows you to
              provide a link to an external site or page. The link will open in
              a new tab or window.
            </ToolTip>
          </Legend>
          <TextInput
            itemId={tour.id}
            type="text"
            label="Link Text"
            model="tour"
            value={tour.link_text}
            id="link_text"
            helpText="Text for external link."
          />
          <TextInput
            itemId={tour.id}
            type="text"
            valueType="url"
            label="Link Address"
            model="tour"
            value={tour.link_address}
            id="link_address"
            helpText="Address for external link. Link must start with https:// or http://"
          />
        </Fieldset>
        <ThemeSelector />
        <Fieldset>
          <Legend className="text-2xl flex space-x-3 my-8">Map Options</Legend>
          <SelectInput
            itemId={tour.id}
            label="Enable Map"
            value={tour.is_geo}
            id="is_geo"
            model="tour"
            helpText="Show stops on a map."
          />
          <SelectInput
            itemId={tour.id}
            label="Provide Google Directions"
            value={tour.use_directions}
            id="use_directions"
            model="tour"
            helpText="Display directions between stops. Directions are provided by Google. You will be able to provide directions for walking, driving, biking, and transit."
          />
          <SelectInput
            itemId={tour.id}
            label="Restrict Map Bounds"
            value={tour.restrict_bounds}
            id="restrict_bounds"
            model="tour"
            helpText="Select to prevent people from zooming out far from your tour or scrolling far away. This restricts the desktop/laptop map to the area around the tour stops."
          />
        </Fieldset>
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <MapControls />
        </APIProvider>
        <TravelModes modes={modes} />
        <div>
          <MediaGrid recordModel="tour" recordId={tour.id} />

          <StopsList />
        </div>
        <div>
          <FlatPageList />
        </div>
      </div>
      <div className="fixed z-50 h-16 bg-gray-300 w-full bottom-0 flex justify-end items-center gap-8 pe-8">
        <div className="flex flex-row grow justify-self-start ms-8 gap-6">
          <SaveButton />
        </div>
        <Preview />
      </div>
    </>
  );
};

export default TourRoute;
