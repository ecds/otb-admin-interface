import { useLoaderData } from "react-router";
import { request } from "~/utils/requests";
import TextInput from "~/components/inputs/TextInput";
import Toggle from "~/components/inputs/Toggle";
import { RecordContext, RelatedContext } from "~/contexts";
import SelectInput from "~/components/inputs/SelectInput";
import { languages } from "~/choices";
import { Fieldset, Legend } from "@headlessui/react";
import ToolTip from "~/components/inputs/ToolTip";
import ThemeSelector from "~/components/ThemeSelector";
import MediaGrid from "~/components/media_grid/MediaGrid";
import MapControls from "~/components/MapControls";
import { APIProvider } from "@vis.gl/react-google-maps";
import type { TTour } from "~/types";
import type { LoaderFunctionArgs } from "react-router";
import StopsList from "~/components/stops/StopsList";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
  const { data: tour } = await request({
    path: `${params.tourSet}/v4/public/tours/${params.tour_id}`,
  });
  return { tour };
};

clientLoader.hydrate = true as const;

const TourRoute = () => {
  const { tour } = useLoaderData<{ tour: TTour }>();

  if (tour) {
    return (
      <RecordContext.Provider
        value={{
          recordId: tour.id,
          tenant: tour.tenant,
          recordModel: "tour",
          tour: tour,
        }}
      >
        <div className="mt-24 px-8 md:px-12 mx-auto max-full md:max-w-10/12 text-black/75">
          <TextInput
            type="text"
            label="Tour Title"
            value={tour.title}
            id="title"
            model="tour"
          />
          <Toggle
            label="Published"
            value={tour.published}
            id="published"
            model="tour"
            helpText="Toggle to make tour publicly available."
          />
          <TextInput
            type="rich-text"
            label="Description"
            value={tour.description}
            id="description"
            model="tour"
          />
          <TextInput
            type="text-area"
            label="Tour Meta Description"
            value={tour.meta_description}
            model="tour"
            id="meta_description"
            helpText="The Meta Description shows up as a text description when the link is shared on social media. Keep it clean of special characters."
          />
          <SelectInput
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
              <ToolTip id={`external-link-${tour.id}`}>
                Link that will display along with the pages. This allows you to
                provide a link to an external site or page. The link will open
                in a new tab or window.
              </ToolTip>
            </Legend>
            <TextInput
              type="text"
              label="Link Text"
              model="tour"
              value={tour.link_text}
              id="link_text"
              helpText="Text for external link."
            />
            <TextInput
              type="text"
              label="Link Address"
              model="tour"
              value={tour.link_address}
              id="link_address"
              helpText="Address for external link."
            />
          </Fieldset>
          <ThemeSelector theme={tour.theme.id} />
          <Fieldset>
            <Legend className="text-2xl flex space-x-3 my-8">
              Map Options
            </Legend>
            <Toggle
              label="Enable Map"
              value={tour.is_geo}
              id="is_geo"
              model="tour"
              helpText="Show stops on a map."
            />
            <Toggle
              label="Provide Google Directions"
              value={tour.use_directions}
              id="use_directions"
              model="tour"
              helpText="Display directions between stops. Directions are provided by Google. You will be able to provide directions for walking, driving, biking, and transit."
            />
            <Toggle
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
          <div>
            <RelatedContext
              value={{ relatedModel: "tour_medium", relatedType: "many" }}
            >
              <MediaGrid media={tour.media} />
            </RelatedContext>
            <StopsList stops={tour.stops} />
          </div>
        </div>
      </RecordContext.Provider>
    );
  }

  return <></>;
};

export default TourRoute;
