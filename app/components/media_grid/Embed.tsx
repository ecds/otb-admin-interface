import { useContext, useEffect, useState } from "react";
import { parseEmbedUrl } from "~/utils/embed_parser";
import TextInput from "../inputs/TextInput";
import { RecordContext, RelatedContext, TourContext } from "~/contexts";
import type { TEmbedProvider, TMedium } from "~/types";
import { sendCreate } from "~/utils/requests";
import { joinImage } from "~/utils/image_upload";

interface Props {
  onSuccess: (data: TMedium) => void;
}
const Embed = ({ onSuccess }: Props) => {
  const [embedUrl, setEmbedUrl] = useState<string | undefined>(undefined);
  const [embedCode, setEmbedCode] = useState<string | undefined>(undefined);
  const [link, setLink] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState<TEmbedProvider | undefined>(
    undefined,
  );
  const { tour } = useContext(TourContext);
  const { recordId, recordModel } = useContext(RecordContext);
  const { relatedModel, relatedType } = useContext(RelatedContext);

  useEffect(() => {
    if (link) {
      const result = parseEmbedUrl(link);
      if (result) {
        setEmbedUrl(result.embedUrl);
        setEmbedCode(result.embedCode);
        setProvider(result.provider);
      }
    }

    return () => {
      setEmbedUrl(undefined);
      setEmbedCode(undefined);
      setProvider(undefined);
    };
  }, [link]);

  const handleInput = (value: string) => {
    setLink(value);
  };

  const addMedium = async () => {
    const body = {
      medium: {
        filename: provider === "unknown" ? null : `${embedCode}.jpg`,
        video: embedCode,
        video_provider: provider,
      },
      model: "medium",
      reindex: {
        model: "tour",
        id: tour.id,
      },
    };
    const { response: createResponse, data: createData } = await sendCreate({
      tenant: tour.tenant,
      body,
    });

    if (createResponse.ok) {
      const { response, data } = await joinImage({
        relatedType,
        recordModel,
        relatedModel,
        recordId,
        imageId: createData.id,
        tenant: tour.tenant,
      });
      if (response.ok && onSuccess) {
        onSuccess(data);
        setEmbedUrl(undefined);
        setEmbedCode(undefined);
        setProvider(undefined);
        setLink(undefined);
      }
    }
  };

  return (
    <div>
      <TextInput
        type="text"
        label="Embed Media"
        model="tour"
        value={link ?? ""}
        id="embed"
        helpText='You can add a video hosted on YouTube or Vimeo by entering the link here. You can add SoundCloud audio by entering the share embed here. Other hosting will not work. The video or audio should appear below automatically if the url or embed is correct. If the media does not appear, double check the url or embed. Once the media appears you can add it to your tour with the "Yes! ADD THIS MEDIUM" button.'
        onChange={handleInput}
        placeholder="Add link to embed media from YouTube, Vimeo, or SoundCloud."
      />

      {embedUrl && (
        <div className="w-96 mb-6">
          <div className="mx-auto my-6 px-6 pb-[56.25%] relative block w-full">
            <iframe
              className="m-auto absolute top-0 left-0"
              width="100%"
              height="100%"
              title="Embed to add"
              src={embedUrl}
              allowFullScreen
            ></iframe>
          </div>
          <button
            className="text-white uppercase hover:text-black mr-5 file:py-2 px-4 py-2 rounded-md border-0 font-semibold file:bg-blue-50 bg-blue-500 hover:bg-blue-300 hover:cursor-pointer"
            onClick={addMedium}
          >
            Yes! Add this medium
          </button>
        </div>
      )}
    </div>
  );
};

export default Embed;
