import { Checkbox, Description, Label, Select } from "@headlessui/react";
import InputWrapper from "./InputWrapper";
import ToolTip from "./ToolTip";
import { useContext, useEffect, useRef, useState } from "react";
import { sendUpdate } from "~/utils/requests";
import {
  FormContext,
  RecordContext,
  RelatedContext,
  TourContext,
} from "~/contexts";
import { useRevalidator } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareCheck } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import { Saving } from "../Saving";
import type { InputProps, TChoices, TSelectableProps } from "~/types";

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
  handleSave,
}: InputProps & SelectProps) => {
  const [currentValue, setCurrentValue] = useState<string | boolean>(value);
  const [saving, setSaving] = useState<boolean>(false);
  const inputRef = useRef<HTMLSelectElement>(null);
  const valueRef = useRef<string | boolean>(value);
  const { tour } = useContext(TourContext);
  const { recordId } = useContext(RecordContext);
  const { error, setError } = useContext(FormContext);
  const revalidator = useRevalidator();
  const { relatedModel, relatedType } = useContext(RelatedContext);

  useEffect(() => {
    const update = async () => {
      const { response } = await sendUpdate({
        tenant: tour.tenant,
        record: recordId,
        body: { model, attribute: id, value: currentValue },
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
      setCurrentValue(tour[id]);
      setSaving(false);
    }
  }, [error, tour, id]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (tour[id as keyof typeof tour] !== currentValue && !error) {
      intervalId = setInterval(revalidator.revalidate, 1000);
      setSaving(true);
    }

    return () => {
      if (intervalId || error) clearInterval(intervalId);
      setSaving(false);
    };
  }, [tour, currentValue, id, revalidator, error]);

  const handleSelect = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
  };

  if (options) {
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
        {saving ? (
          <Saving />
        ) : (
          <Select
            name={id}
            ref={inputRef}
            className="basis-full border border-gray-300 border-default-medium text-heading text-base rounded-base focus:ring-brand focus:border-brand block rounded-md px-4 py-3.5 shadow-xs me-0"
            onChange={handleSelect}
            value={currentValue as string}
            disabled={saving}
          >
            <option value="" selected>
              Select a value
            </option>
            {options.map((option) => {
              return (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              );
            })}
          </Select>
        )}
      </InputWrapper>
    );
  }

  return (
    <InputWrapper className="flex items-center space-x-4">
      {saving ? (
        <Saving />
      ) : (
        <>
          <Checkbox
            className="group block cursor-pointer"
            id={id}
            checked={currentValue as boolean}
            onChange={() => setCurrentValue(!currentValue)}
          >
            <FontAwesomeIcon
              icon={currentValue ? faSquareCheck : faSquare}
              className="group-data-checked:text-blue-500 text-2xl"
            />
          </Checkbox>
          <Label className="font-medium text-black/75 select-none">
            {label}
          </Label>
          {helpText && (
            <Description as="div">
              <ToolTip id={`toggle-${id}`}>{helpText}</ToolTip>
            </Description>
          )}
        </>
      )}
    </InputWrapper>
  );
};

export default SelectInput;
