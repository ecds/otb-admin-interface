import {
  lazy,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Description, Input, Textarea } from "@headlessui/react";
import { sendUpdate } from "~/utils/requests";
import InputWrapper from "./InputWrapper";
import { RecordContext } from "~/contexts";
import ToolTip from "./ToolTip";
import ClientOnly from "../ClientOnly";
import type { InputProps, TServerResponse } from "~/types";
import { useRevalidator } from "react-router";

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

const padding = (size: "large" | "small") => {
  switch (size) {
    case "large":
      return "px-4 py-3.5";
    case "small":
      return "px-3 py-2.5";
    default:
      break;
  }
};

type TextInputProps = {
  value: string | number;
  type: "text" | "text-area" | "rich-text" | "color";
  itemId?: number;
  updateCallback?: (data: TServerResponse) => void;
  size?: "small" | "large";
  valueType?: "text" | "number" | "url" | "button" | "file";
  placeholder?: string;
  revalidate?: boolean;
};

const TextInput = ({
  helpText,
  id,
  label,
  model,
  value,
  type,
  onChange,
  itemId,
  updateCallback,
  size = "large",
  valueType = "text",
  placeholder,
  revalidate,
}: InputProps & TextInputProps) => {
  const [currentValue, setCurrentValue] = useState<string | number>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string | number>(value);
  const { recordId, tenant, tour } = useContext(RecordContext);
  const revalidator = useRevalidator();

  const update = useCallback(async () => {
    if (!tour) return;
    const { response, data } = await sendUpdate({
      tenant,
      record: itemId ?? recordId,
      body: {
        model,
        attribute: id,
        value: currentValue,
        reindex: { id: tour.id, model: "tour" },
      },
    });

    valueRef.current = currentValue;

    if (response.ok && updateCallback) {
      updateCallback(data as TServerResponse);
    }
    if (revalidate) revalidator.revalidate();
  }, [
    tour,
    tenant,
    recordId,
    model,
    currentValue,
    id,
    itemId,
    updateCallback,
    revalidate,
    revalidator,
  ]);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (onChange || !inputRef.current?.validity.valid) return;

    if (currentValue === valueRef.current) return;

    const timeoutId = setTimeout(() => {
      if (currentValue !== valueRef.current) update();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentValue, id, model, recordId, tenant, update, onChange]);

  const handleChange = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
    if (onChange) onChange(inputRef.current.value);
  };

  const handleBlur = async () => {
    if (!inputRef.current?.validity.valid) return;
    await update();
    revalidator.revalidate();
  };

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
      <div className="basis-full me-0">
        {type === "text" && (
          <Input
            ref={inputRef}
            type={valueType}
            id={`${model}-${id}`}
            className={`w-full border border-default-medium border-gray-300 text-heading text-base rounded-base focus:ring-blue-100 focus:border-blue-100 block rounded-md ${padding(size)} shadow-xs placeholder:text-body`}
            value={currentValue ?? ""}
            onInput={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
          ></Input>
        )}
        {type === "text-area" && (
          <Textarea
            className="w-full border border-gray-300 data-focus:bg-blue-100 data-hover:shadow p-4 rounded-md"
            ref={inputRef}
            onInput={handleChange}
            value={currentValue ?? ""}
            onBlur={handleBlur}
          />
        )}
        {type === "rich-text" && (
          <ClientOnly>
            <JoditEditor
              value={currentValue.toString() ?? ""}
              config={config}
              onChange={(newValue) => setCurrentValue(newValue)}
              onBlur={handleBlur}
            />
          </ClientOnly>
        )}
        {/* {valueType === "file" && <input type={valueType} accept="image/*" />} */}
        {type === "color" && (
          <Input
            ref={inputRef}
            type="color"
            id={`${model}-${id}`}
            value={currentValue ?? ""}
            onInput={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
          ></Input>
        )}
      </div>
      <p className="text-sm text-red-400">
        {inputRef.current?.validationMessage}
      </p>
    </InputWrapper>
  );
};

export default TextInput;
