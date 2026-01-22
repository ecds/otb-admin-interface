import { Description, Select } from "@headlessui/react";
import InputWrapper from "./InputWrapper";
import type { InputProps, TChoices } from "~/types";
import ToolTip from "./ToolTip";
import { useContext, useEffect, useRef, useState } from "react";
import { sendUpdate } from "~/utils/requests";
import { RecordContext } from "~/contexts";

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
  const inputRef = useRef<HTMLSelectElement>(null);
  const valueRef = useRef<string>(value);
  const { tenant, recordId } = useContext(RecordContext);

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
  }, [currentValue, tenant, model, id, recordId]);

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
      <Select
        name={id}
        ref={inputRef}
        className="basis-full border border-gray-300 border-default-medium text-heading text-base rounded-base focus:ring-brand focus:border-brand block rounded-md px-4 py-3.5 shadow-xs"
        onChange={handleSelect}
        value={currentValue}
      >
        {options.map((option) => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </Select>
    </InputWrapper>
  );
};

export default SelectInput;
