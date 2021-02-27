import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useField } from "formik";
import React from "react";

// Adding & {name: string} like below overwrites default type. Like name was aoptional in the React.InputHTMLAttributes<HTMLInputElement> but we made it required
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _, // _tells we are removing it from props
  ...props
}) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <Input {...field} {...props} id={field.name} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
