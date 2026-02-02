import { useContext, useState } from "react";
import {
  FormContext,
  RecordContext,
  RelatedContext,
  StopMapContext,
} from "~/contexts";
import TextInput from "../inputs/TextInput";
import type { TServerResponse, TStop } from "~/types";
import FileUpload from "../inputs/FileUpload";
import { Saving } from "../Saving";
import DeleteButton from "../media_grid/DeleteButton";
import ToolTip from "../inputs/ToolTip";
import IconModal from "../stops/IconModal";
import { sendUpdate } from "~/utils/requests";

const MarkerStyle = () => {
  const context = useContext(StopMapContext);
  if (!context) throw new Error("StopMapContext is undefined");
  const { iconColor, mapIcon, setIconColor, setMapIcon, stop } = context;
  const { tenant, tour } = useContext(RecordContext);
  const [upLoading, setUpLoading] = useState<boolean>(false);
  const [iconModalOpen, setIconModalOpen] = useState<boolean>(false);

  const updateIconColor = (data: TServerResponse) => {
    if (setIconColor) setIconColor((data as TStop).icon_color);
  };

  const iconAdded = (data: unknown) => {
    if (setMapIcon) setMapIcon((data as TStop).map_icon);
    setUpLoading(false);
  };

  const handleDelete = async () => {
    if (!tour) return;
    const { response } = await sendUpdate({
      tenant,
      record: stop.id,
      body: {
        model: "stop",
        attribute: "map_icon",
        value: null,
        reindex: {
          model: "tour",
          id: tour.id,
        },
      },
    });
    if (response.ok && setMapIcon) setMapIcon(undefined);
  };

  return (
    <div className="flex flex-col gap-4">
      <TextInput
        label="Icon Color"
        type="color"
        value={iconColor ?? "#D32F2F"}
        model="stop"
        id="icon_color"
        helpText="Select a color for the map maker. Be sure to pick a color that is easily seen on the map and the stop number is readable."
        updateCallback={updateIconColor}
      />
      <RelatedContext.Provider
        value={{ relatedModel: "map_icon", relatedType: "one" }}
      >
        <div className="-mt-6">
          {upLoading ? (
            <Saving />
          ) : (
            <FileUpload
              model="map_icon"
              onSuccess={iconAdded}
              onStart={() => setUpLoading(true)}
              className="text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
            >
              <span className="flex flex-row gap-2">
                Upload New Icon{" "}
                <ToolTip id="new-icon-tooltip">
                  Upload a custom icon for this stop. The file must be an image
                  (jpeg, png, or webp) and no larger than 80 pixels by 80
                  pixels. Once uploaded, the icon be used on other stops by
                  clicking the &quot;Use Existing Icon&quot; link below.
                </ToolTip>
              </span>
            </FileUpload>
          )}
        </div>
        <div className="flex flex-row ">
          <button
            className="gap-2 text-blue-500 hover:underline hover:text-blue-700 cursor-pointer"
            onClick={() => setIconModalOpen(true)}
          >
            Use Existing Icon{" "}
          </button>
          <ToolTip id="existing-icon-tooltip">
            Reuse previously added icon.
          </ToolTip>
        </div>
        <IconModal open={iconModalOpen} setOpen={setIconModalOpen} />
        {mapIcon && (
          <FormContext.Provider value={{ handleDelete, recordId: stop.id }}>
            <div className="flex flex-row gap-2">
              <DeleteButton
                removing="Map Icon"
                className="bg-red-600/75 text-white/90 hover:bg-red-200 hover:text-black/75 drop-shadow-lg px-2 py-1 rounded-sm"
              >
                Remove Custom Icon
              </DeleteButton>
              <ToolTip id="remove-icon-tooltip">
                This will only remove the from this stop.
              </ToolTip>
            </div>
          </FormContext.Provider>
        )}
      </RelatedContext.Provider>
    </div>
  );
};

export default MarkerStyle;
