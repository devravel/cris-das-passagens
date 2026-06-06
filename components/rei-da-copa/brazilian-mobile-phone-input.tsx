"use client";

import { PatternFormat } from "react-number-format";

import { Input } from "@/components/ui/input";

type BrazilianMobilePhoneInputProps = Omit<
  React.ComponentProps<typeof PatternFormat>,
  "customInput" | "format" | "valueIsNumericString"
>;

export function BrazilianMobilePhoneInput(props: BrazilianMobilePhoneInputProps) {
  return (
    <PatternFormat
      format="(##) #####-####"
      customInput={Input}
      valueIsNumericString={false}
      {...props}
    />
  );
}
