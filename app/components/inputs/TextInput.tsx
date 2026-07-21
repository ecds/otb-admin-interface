import {
  lazy,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Description, Input, Textarea } from "@headlessui/react";
import { sendUpdate } from "~/utils/requests";
import InputWrapper from "./InputWrapper";
import { RecordContext, TourContext } from "~/contexts";
import ToolTip from "./ToolTip";
import ClientOnly from "../ClientOnly";
import { useRevalidator } from "react-router";
import { enforceA11yOnLinks } from "~/utils/a11y";
import type { InputProps, TServerResponse } from "~/types";

const JoditEditor = lazy(() => import("jodit-react"));

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

type RangeProps = {
  max: number;
  min: number;
};

type TextInputProps = {
  value: string | number;
  type: "text" | "text-area" | "rich-text" | "color" | "range";
  itemId?: number;
  updateCallback?: (data: TServerResponse) => void;
  size?: "small" | "large";
  valueType?: "text" | "number" | "url" | "button" | "file";
  placeholder?: string;
  range?: RangeProps;
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
  range,
}: InputProps & TextInputProps) => {
  const [currentValue, setCurrentValue] = useState<string | number>(value);
  const [serverError, setServerError] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<string | number>(value);
  const { tour, setLastUpdated, setIsSaving } = useContext(TourContext);
  const { recordId } = useContext(RecordContext);
  const revalidator = useRevalidator();

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Start typing...",
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
      toolbarAdaptive: false,

      // Enforce a11y whenever Jodit processes a link dialog save
      // or the user pastes content with links
      events: {
        afterInsertNode(node: Node) {
          if (
            node instanceof HTMLAnchorElement &&
            node.getAttribute("target") === "_blank"
          ) {
            const rel = new Set(
              (node.getAttribute("rel") ?? "").split(" ").filter(Boolean),
            );
            rel.add("noopener");
            rel.add("noreferrer");
            node.setAttribute("rel", [...rel].join(" "));

            const linkText = node.textContent?.trim() ?? "";
            if (
              !node.getAttribute("aria-label")?.includes("opens in a new tab")
            ) {
              node.setAttribute(
                "aria-label",
                `${linkText} (opens in a new tab)`,
              );
            }
          }
        },
      },
    }),
    [],
  );

  const update = useCallback(async () => {
    if (!tour) return;
    setIsSaving(true);
    const { response, data } = await sendUpdate({
      tenant: tour.tenant,
      record: itemId ?? recordId,
      body: {
        model,
        [model]: { [id]: currentValue },
        reindex: { id: tour.id, model: "tour" },
      },
    });

    valueRef.current = currentValue;

    setIsSaving(false);
    if (response.ok) {
      setServerError(undefined);
      valueRef.current = currentValue;
      if (updateCallback) {
        updateCallback(data as TServerResponse);
        const now = new Date();
        setLastUpdated(now.toLocaleString());
      }
    } else {
      const detail = data?.errors?.[0]?.detail;
      setServerError(detail ?? "Could not save. Please try again.");
      setCurrentValue(valueRef.current);
    }
  }, [
    tour,
    recordId,
    model,
    currentValue,
    id,
    itemId,
    updateCallback,
    setLastUpdated,
    setIsSaving,
  ]);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  useEffect(() => {
    if (onChange) return;

    if (currentValue === valueRef.current) return;
  }, [currentValue, id, model, recordId, update, onChange, type]);

  const handleChange = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
    if (onChange) onChange(inputRef.current.value);
  };

  // And update the onChange to run the HTML-level pass
  // (catches pastes and source-mode edits that bypass afterInsertNode)
  const handleRichTextChange = useCallback((newValue: string) => {
    const enforced = enforceA11yOnLinks(newValue);
    setCurrentValue(enforced);
  }, []);

  const handleBlur = async () => {
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
            step="any"
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
              value={currentValue?.toString() ?? ""}
              config={config}
              onChange={handleRichTextChange}
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
        {type === "range" && range && (
          <>
            <Input
              ref={inputRef}
              type="range"
              min={range.min}
              max={range.max}
              value={currentValue}
              onInput={handleChange}
              onBlur={handleBlur}
              onMouseUp={handleBlur}
              onChange={handleChange}
              className="w-full"
            />
            <div className="flex flex-row justify-between">
              <div>{range.min}</div>
              <div>{currentValue}</div>
              <div>{range.max}</div>
            </div>
          </>
        )}
      </div>
      <p className="text-sm text-red-400">
        {serverError ?? inputRef.current?.validationMessage}
      </p>
    </InputWrapper>
  );
};

export default TextInput;
