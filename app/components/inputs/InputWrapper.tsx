import { Field } from "@headlessui/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

const InputWrapper = ({ children, className }: Props) => {
  return <Field className={`mb-8 ${className}`}>{children}</Field>;
};

export default InputWrapper;
