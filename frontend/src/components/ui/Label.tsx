import { type LabelHTMLAttributes } from "react";

export default function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={`block text-gray-700 text-sm font-bold mb-2 ${props.className ?? ""}`}
    />
  );
}
