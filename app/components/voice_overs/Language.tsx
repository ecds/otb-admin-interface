import { Dialog, DialogBackdrop, DialogPanel, Select } from "@headlessui/react";
import { VOICE_OVER_LANGUAGES } from "~/utils/voice_over_languages";
import { useEffect, useRef, useState } from "react";
import InputWrapper from "../inputs/InputWrapper";
import { safeId } from "~/utils/a11y";

interface Props {
  takenLanguages: string[];
  show: boolean;
  onSelect: (language: string) => void;
  onCancel: () => void;
}

const Language = ({ takenLanguages, show, onSelect, onCancel }: Props) => {
  const inputRef = useRef<HTMLSelectElement>(null);
  const [language, setLanguage] = useState<string | undefined>(undefined);

  const inputId = safeId();

  // Start fresh each time the dialog reopens for a new upload.
  useEffect(() => {
    if (!show) setLanguage(undefined);
  }, [show]);

  const handleSelect = () => {
    if (!inputRef.current) return;
    setLanguage(inputRef.current.value);
    onSelect(inputRef.current.value);
  };

  return (
    <Dialog open={show} onClose={onCancel}>
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 z-1000">
        <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
          <p>
            OpenTour Builder supports a small, hand-picked set of languages for
            voice-over narration. We add each one individually rather than
            pulling from a generic list of thousands, so that names and
            translations stay accurate.
          </p>
          <p>
            Don&apos;t see the language you need?{" "}
            <a
              href="mailto:ecds@emory.edu"
              className="text-blue-500 underline hover:text-blue-800"
            >
              Email ECDS
            </a>{" "}
            at ecds@emory.edu and we&apos;ll add it.
          </p>
          <InputWrapper className="flex flex-wrap space-x-3">
            <label htmlFor={inputId} className="sr-only">
              Select Language
            </label>
          </InputWrapper>
          <div className="relative basis-full">
            <Select
              ref={inputRef}
              onChange={handleSelect}
              value={language ?? ""}
              name={inputId}
              className="appearance-none border w-full border-gray-300 border-default-medium text-heading text-base rounded-base focus:ring-brand focus:border-brand block rounded-md px-4 py-3.5 shadow-xs me-0"
            >
              <option value="" disabled>
                Select Language
              </option>
              {VOICE_OVER_LANGUAGES.filter(
                (lang) => !takenLanguages.includes(lang.value),
              ).map((lang) => {
                return (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                );
              })}
            </Select>
          </div>
          <button onClick={onCancel}>Cancel</button>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default Language;
