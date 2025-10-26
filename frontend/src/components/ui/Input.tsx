import {type InputHTMLAttributes} from "react";
import Label from "./Label";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    variant?: "default" | "error";
};

export default function Input({
  label,
  variant = "default",
  className = "",
  ...rest
}: InputProps) {
  const base =
    "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ";

  const variantClass =
    variant === "error" ? "border-red-500 mb-3" : "";

    return (
        <div className="mb-4">
            {label && <Label htmlFor={rest.id}>{label}</Label>} 

            <input
                className={`${base} ${variantClass} ${className}`}
                {...rest}
            />

            {variant === "error" && (
                <p className="text-red-500 text-xs italic mt-1">
                    Senha incorreta.
                </p>
            )}
        </div>
    );
}
