import { Checkbox, Description, Label, Select } from "@headlessui/react";
import InputWrapper from "./InputWrapper";
import ToolTip from "./ToolTip";
import { useContext, useEffect, useRef, useState } from "react";
import { sendUpdate } from "~/utils/requests";
import { ErrorContext, RecordContext, TourContext } from "~/contexts";
import { useRevalidator } from "react-router";
import { useSyncPoll } from "~/hooks/useSyncPoll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSquareCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import type { InputProps, TChoices, TSelectableProps } from "~/types";
import { safeId } from "~/utils/a11y";

type SelectProps = {
  value: string | boolean;
  options?: TChoices[];
  id: TSelectableProps;
  handleSave?: () => void;
};

const SelectInput = ({
  id,
  label,
  model,
  value,
  helpText,
  options,
}: InputProps & SelectProps) => {
  const [currentValue, setCurrentValue] = useState<string | boolean>(value);
  const inputRef = useRef<HTMLSelectElement>(null);
  const valueRef = useRef<string | boolean>(value);
  const { tour, isSaving, setIsSaving } = useContext(TourContext);
  const { recordId } = useContext(RecordContext);
  const { error, setError } = useContext(ErrorContext);
  const revalidator = useRevalidator();
  const inputId = safeId();

  useEffect(() => {
    const update = async () => {
      const { response } = await sendUpdate({
        tenant: tour.tenant,
        record: recordId,
        body: { model, [model]: { [id]: currentValue } },
      });
      if (response.ok) {
        valueRef.current = currentValue;
      } else {
        if (setError) setError(`An error occurred updating ${label}.`);
      }
    };

    if (valueRef.current !== currentValue) update();
  }, [currentValue, model, id, recordId, revalidator, tour, setError, label]);

  useEffect(() => {
    if (error) {
      setCurrentValue(valueRef.current);
      setIsSaving(false);
    }
  }, [error, tour, id, setIsSaving]);

  const isPendingSync =
    tour[id as keyof typeof tour] !== currentValue && !error;

  useSyncPoll({
    pending: isPendingSync,
    revalidate: revalidator.revalidate,
    onTimeout: () => {
      if (setError)
        setError(`Could not confirm ${label} was saved. Please refresh.`);
    },
  });

  useEffect(() => {
    setIsSaving(isPendingSync);
  }, [isPendingSync, setIsSaving]);

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
          id={`${id}-${recordId}`}
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
