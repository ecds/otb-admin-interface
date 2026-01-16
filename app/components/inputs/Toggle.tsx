import InputWrapper from "./InputWrapper";
import { useContext, useEffect, useRef, useState } from "react";
import { RecordContext } from "~/contexts";
import { sendUpdate } from "~/utils/fetchers";
import ToolTip from "./ToolTip";
import { Checkbox, Description, Label } from "@headlessui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type { InputProps } from "~/types";

const Toggle = ({
  helpText,
  id,
  label,
  model,
  value,
}: InputProps & { value: boolean }) => {
  const [currentValue, setCurrentValue] = useState<boolean>(value);
  const { recordId, tenant } = useContext(RecordContext);
  const valueRef = useRef<boolean>(value);

  useEffect(() => {
    const update = async () => {
      await sendUpdate({
        tenant,
        record: recordId,
        body: { model, attribute: id, value: currentValue },
      });
      valueRef.current = currentValue;
    };

    if (currentValue !== valueRef.current) update();
  }, [currentValue, id, model, recordId, tenant]);

  return (
    <InputWrapper className="flex items-center space-x-4">
      <Checkbox
        className="group block size-6 rounded border bg-white data-checked:bg-blue-500"
        id={id}
        checked={currentValue}
        onChange={() => setCurrentValue(!currentValue)}
      >
        <FontAwesomeIcon
          icon={faCheck}
          className="text-white opacity-0 text-lg group-data-checked:opacity-100"
        />
      </Checkbox>
      <Label className="font-medium text-black/75 select-none">{label}</Label>
      {helpText && (
        <Description as="div">
          <ToolTip id={`toggle-${id}`}>{helpText}</ToolTip>
        </Description>
      )}
    </InputWrapper>
  );
};

export default Toggle;
