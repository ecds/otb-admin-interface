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
import { useSyncPoll } from "~/hooks/useSyncPoll";
import { findRecordValue } from "~/utils/find_in_tour";
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
  // Set only once a save has actually gone out, so we only poll while
  // waiting to see OUR write reflected — not whenever `value` happens to
  // differ from tour data for unrelated reasons (e.g. a live map viewport).
  const savedValueRef = useRef<string | number | undefined>(undefined);
  // Jodit is only sanitized/committed on blur, not on every keystroke — see
  // handleRichTextChange for why.
  const richTextRef = useRef<string>(typeof value === "string" ? value : "");
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
    const valueToSave =
      type === "rich-text" ? richTextRef.current : currentValue;
    setIsSaving(true);
    const { response, data } = await sendUpdate({
      tenant: tour.tenant,
      record: itemId ?? recordId,
      body: {
        model,
        [model]: { [id]: valueToSave },
        reindex: { id: tour.id, model: "tour" },
      },
    });

    setIsSaving(false);
    if (response.ok) {
      setServerError(undefined);
      valueRef.current = valueToSave;
      savedValueRef.current = valueToSave;
      setCurrentValue(valueToSave);
      if (updateCallback) {
        updateCallback(data as TServerResponse);
        const now = new Date();
        setLastUpdated(now.toLocaleString());
      }
    } else {
      const detail = data?.errors?.[0]?.detail;
      setServerError(detail ?? "Could not save. Please try again.");
      setCurrentValue(valueRef.current);
      if (type === "rich-text")
        richTextRef.current = valueRef.current as string;
    }
  }, [
    tour,
    recordId,
    model,
    currentValue,
    id,
    itemId,
    type,
    updateCallback,
    setLastUpdated,
    setIsSaving,
  ]);

  useEffect(() => {
    setCurrentValue(value);
    if (type === "rich-text" && typeof value === "string") {
      richTextRef.current = value;
    }
  }, [value, type]);

  const targetRecordId = itemId ?? recordId;
  const confirmedValue = tour
    ? findRecordValue(tour, model, targetRecordId, id)
    : undefined;
  const isPendingSync =
    savedValueRef.current !== undefined &&
    String(confirmedValue) !== String(savedValueRef.current);

  useSyncPoll({
    pending: isPendingSync,
    revalidate: revalidator.revalidate,
    onTimeout: () => {
      setServerError("Could not confirm the save. Please refresh.");
      savedValueRef.current = undefined;
    },
  });

  useEffect(() => {
    if (!isPendingSync) savedValueRef.current = undefined;
  }, [isPendingSync]);

  const handleChange = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
    if (onChange) onChange(inputRef.current.value);
  };

  // Buffer into a ref instead of setState: feeding the sanitized value back
  // into Jodit's controlled `value` prop on every keystroke made the cursor
  // jump to the start and dropped keystrokes. The buffered value is only
  // committed to state (and sent to the server) on blur, in `update()`.
  const handleRichTextChange = useCallback((newValue: string) => {
    richTextRef.current = enforceA11yOnLinks(newValue);
  }, []);

  const handleBlur = async () => {
    await update();
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
          <ToolTip>{helpText}</ToolTip>
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
