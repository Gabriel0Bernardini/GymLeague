import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "blue" | "gray" | "outline";
};

export default function Button({
  children,
  variant = "blue",
  className = "",
  ...rest
}: ButtonProps) {
  const baseClass = "rounded px-4 py-2 font-semibold transition-colors duration-200";

  const colorClass =
    variant === "blue"
      ? "bg-blue-500 text-white hover:bg-blue-600"
      : variant === "gray"
      ? "bg-gray-300 text-white hover:bg-gray-400"
      : "border border-blue-600 text-blue-600 hover:bg-blue-50";

  const loadingClass = rest.disabled ? "cursor-not-allowed opacity-50" : "";

  return (
    <button className={`btn ${baseClass} ${colorClass} ${loadingClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
