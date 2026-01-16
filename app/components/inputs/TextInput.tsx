import {
  lazy,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Description, Input, Textarea } from "@headlessui/react";
import { sendUpdate } from "~/utils/fetchers";
import InputWrapper from "./InputWrapper";
import { RecordContext } from "~/contexts";
import type { InputProps } from "~/types";
import ToolTip from "./ToolTip";
import ClientOnly from "../ClientOnly";

const JoditEditor = lazy(() => import("jodit-react"));

const config = {
  readonly: false,
  placeholder: "Start typings...",
  buttons: [
    "bold",
    "strikethrough",
    "underline",
    "italic",
    "ul",
    "ol",
    "link",
    "indent",
    "undo",
    "redo",
    "source",
  ],
  statusbar: false,
  height: 200,
};

type TextInputProps = {
  value: string;
  type: "text" | "text-area" | "rich-text";
};

const TextInput = ({
  helpText,
  id,
  label,
  model,
  value,
  type,
}: InputProps & TextInputProps) => {
  const [currentValue, setCurrentValue] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string>(value);

  const { recordId, tenant } = useContext(RecordContext);

  const update = useCallback(async () => {
    await sendUpdate({
      tenant,
      record: recordId,
      body: { model, attribute: id, value: currentValue },
    });
    valueRef.current = currentValue;
  }, [tenant, recordId, model, currentValue, id]);

  useEffect(() => {
    if (currentValue === valueRef.current) return;

    const timeoutId = setTimeout(() => {
      if (currentValue !== valueRef.current) update();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentValue, id, model, recordId, tenant, update]);

  const handleChange = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
  };

  // const handleRichTextChange = (value) => {
  //   setCurrentValue
  // }

  return (
    <InputWrapper className="flex flex-wrap space-x-3">
      <label
        htmlFor={`${model}-${id}`}
        className="block mb-2.5 font-medium text-black/75"
      >
        {label}
      </label>
      {helpText && (
        <Description as="div">
          <ToolTip id={`text-${model}-${id}`}>{helpText}</ToolTip>
        </Description>
      )}
      <div className="basis-full">
        {type === "text" && (
          <Input
            ref={inputRef}
            type="text"
            id={`${model}-${id}`}
            className="w-full border border-default-medium border-gray-300 text-heading text-base rounded-base focus:ring-blue-100 focus:border-blue-100 block rounded-md px-4 py-3.5 shadow-xs placeholder:text-body"
            value={currentValue ?? ""}
            onInput={handleChange}
            onBlur={update}
          ></Input>
        )}
        {type === "text-area" && (
          <Textarea
            className="w-full border border-gray-300 data-focus:bg-blue-100 data-hover:shadow p-4 rounded-md"
            ref={inputRef}
            onInput={handleChange}
            value={currentValue ?? ""}
          />
        )}
        {type === "rich-text" && (
          <ClientOnly>
            <JoditEditor
              value={currentValue ?? ""}
              config={config}
              onChange={(newValue) => setCurrentValue(newValue)}
            />
          </ClientOnly>
        )}
      </div>
    </InputWrapper>
  );
};

export default TextInput;
