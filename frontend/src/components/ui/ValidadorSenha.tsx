import { useEffect } from "react";

interface ValidadorSenhaProps {
  password: string;
  visible?: boolean;
  onValidationChange?: (isValid: boolean) => void; // 🔹 nova prop
}

export default function ValidadorSenha({ password, visible, onValidationChange }: ValidadorSenhaProps) {
  const criterios = [
    { label: "Pelo menos 6 caracteres", isValid: password.length >= 6 },
    { label: "Uma letra maiúscula", isValid: /[A-Z]/.test(password) },
    { label: "Uma letra minúscula", isValid: /[a-z]/.test(password) },
    { label: "Um número", isValid: /\d/.test(password) },
    { label: "Um símbolo", isValid: /[!@#$%^&*(),.?\":{}|<>]/.test(password) },
  ];
  
  // se todos os critérios são válidos
  const allValid = criterios.every(c => c.isValid); 

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(allValid);
    }
  }, [allValid, onValidationChange]);

  return (
    <div
      className={`absolute bg-white shadow-md border border-gray-300 rounded-lg p-4 mt-2 w-72 transition-all duration-200 ${
        visible ? "opacity-100 -translate-y-5" : "opacity-0 pointer-events-none -translate-y-2"
      }`}
    >
      <span className="text-gray-700 text-sm font-medium mb-2 block">
        A senha deve conter:
      </span>
      <ul className="grid grid-cols-1 gap-1">
        {criterios.map((criterio, index) => (
          <li
            key={index}
            className={`text-sm flex items-center ${
              criterio.isValid ? "text-green-500" : "text-gray-400"
            }`}
          >
            {criterio.isValid ? <span>&#10003;&nbsp;</span> : <span>&#8226;&nbsp;</span>}
            {criterio.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
