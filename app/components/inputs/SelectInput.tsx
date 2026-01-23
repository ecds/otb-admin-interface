import { Description, Select } from "@headlessui/react";
import InputWrapper from "./InputWrapper";
import ToolTip from "./ToolTip";
import { useContext, useEffect, useRef, useState } from "react";
import { sendUpdate } from "~/utils/requests";
import { RecordContext } from "~/contexts";
import { useRevalidator } from "react-router";
import type { InputProps, TChoices } from "~/types";

type SelectProps = {
  value: string;
  options: TChoices[];
};

const SelectInput = ({
  id,
  label,
  model,
  value,
  helpText,
  options,
}: InputProps & SelectProps) => {
  const [currentValue, setCurrentValue] = useState<string>(value);
  const [saving, setSaving] = useState<boolean>(false);
  const inputRef = useRef<HTMLSelectElement>(null);
  const valueRef = useRef<string>(value);
  const { tenant, recordId, tour } = useContext(RecordContext);
  const revalidator = useRevalidator();

  useEffect(() => {
    const update = async () => {
      await sendUpdate({
        tenant,
        record: recordId,
        body: { model, attribute: id, value: currentValue },
      });
      valueRef.current = currentValue;
    };

    if (valueRef.current !== currentValue) update();
  }, [currentValue, tenant, model, id, recordId, revalidator, tour]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (tour && tour[id] !== currentValue) {
      intervalId = setInterval(revalidator.revalidate, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [tour, currentValue, id, revalidator]);

  useEffect(() => {
    if (tour) setSaving(currentValue !== tour[id]);
  }, [currentValue, tour, id]);

  const handleSelect = () => {
    if (!inputRef.current) return;
    setCurrentValue(inputRef.current.value);
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
      {saving ? (
        <p>saving</p>
      ) : (
        <Select
          name={id}
          ref={inputRef}
          className="basis-full border border-gray-300 border-default-medium text-heading text-base rounded-base focus:ring-brand focus:border-brand block rounded-md px-4 py-3.5 shadow-xs me-0"
          onChange={handleSelect}
          value={currentValue}
          disabled={saving}
        >
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
};

export default SelectInput;
