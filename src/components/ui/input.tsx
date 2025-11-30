import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`w-full bg-black border-2 border-[#00FFFF] text-white rounded-lg px-4 py-4 focus:outline-none focus:border-[#00FFFF] transition-colors text-lg font-bold text-center min-h-[60px] ${className}`}
      {...props}
    />
  );
}