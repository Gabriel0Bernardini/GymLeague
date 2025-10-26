import { type ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "blue" | "gray";
};

export default function Button({
  children,
  variant = "blue",
  className = "",
  ...rest
}: ButtonProps) {
  const colorClass = (variant === "blue" 
  ? "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
  : "bg-gray-300 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded");

  const loadingClass = rest.disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button className={`btn ${colorClass} ${loadingClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
