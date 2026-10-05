import { Checkbox, Description, Label, Select } from "@headlessui/react";
import InputWrapper from "./InputWrapper";
import ToolTip from "./ToolTip";
import { useContext, useEffect, useRef, useState } from "react";
import { sendUpdate } from "~/utils/requests";
import { FeedbackContext } from "~/contexts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import type { InputProps, TChoices, TSelectableProps } from "~/types";
import { safeId } from "~/utils/a11y";
import { useTenant, useTourStore } from "~/store/tourStore";

type SelectProps = {
  value: string | boolean;
  options?: TChoices[];
  id: TSelectableProps;
  handleSave?: () => void;
  itemId: number;
};

const SelectInput = ({
  itemId,
  id,
  label,
  model,
  value,
  helpText,
  options,
}: InputProps & SelectProps) => {
  const [currentValue, setCurrentValue] = useState<string | boolean>(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLSelectElement>(null);
  const valueRef = useRef<string | boolean>(value);
  const tenant = useTenant();
  const beginSave = useTourStore((s) => s.beginSave);
  const endSave = useTourStore((s) => s.endSave);
  const { setFeedback } = useContext(FeedbackContext);
  const applySavedField = useTourStore((s) => s.applySavedField);
  const inputId = safeId();

  useEffect(() => {
    if (valueRef.current === currentValue) return;

    const update = async () => {
      setIsSaving(true);
      beginSave();
      const { response } = await sendUpdate({
        tenant,
        record: itemId,
        body: { model, [model]: { [id]: currentValue } },
      });
      setIsSaving(false);
      endSave(response.ok);
      if (response.ok) {
        valueRef.current = currentValue;
        applySavedField(model, itemId, id, currentValue);
      } else {
        setCurrentValue(valueRef.current);
        setFeedback({
          type: "error",
          message: `An error occurred updating ${label}.`,
        });
      }
    };

    update();
  }, [
    currentValue,
    model,
    id,
    itemId,
    tenant,
    setFeedback,
    label,
    applySavedField,
    beginSave,
    endSave,
  ]);

  const handleSelect = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
  };

  if (options) {
    return (
      <InputWrapper className="flex flex-wrap space-x-3">
        <label
          htmlFor={inputId}
          className="block mb-2.5 font-medium text-black/75"
        >
          {label}
        </label>
        {helpText && (
          <Description as="div">
            <ToolTip>{helpText}</ToolTip>
          </Description>
        )}
        <div className="relative basis-full">
          <Select
            name={id}
            id={inputId}
            ref={inputRef}
            className="appearance-none border w-full border-gray-300 border-default-medium text-heading text-base rounded-base focus:ring-brand focus:border-brand block rounded-md px-4 py-3.5 shadow-xs me-0"
            onChange={handleSelect}
            value={(currentValue as string) ?? options[0].value}
            disabled={isSaving}
          >
            {options.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </Select>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="group pointer-events-none absolute top-5 right-3 size-4"
            aria-hidden="true"
          />
        </div>
      </InputWrapper>
    );
  }

  return (
    <InputWrapper className="flex items-center space-x-4">
      <>
        <Checkbox
          className="group block cursor-pointer"
          id={`${id}-${itemId}`}
          checked={currentValue as boolean}
          onChange={() => setCurrentValue(!currentValue)}
        >
          <FontAwesomeIcon
            icon={currentValue ? faSquareCheck : faSquare}
            className="group-data-checked:text-blue-500 text-2xl"
          />
        </Checkbox>
        <Label className="font-medium text-black/75 select-none">{label}</Label>
        {helpText && (
          <Description as="div">
            <ToolTip>{helpText}</ToolTip>
          </Description>
        )}
      </>
    </InputWrapper>
  );
};

export default SelectInput;
