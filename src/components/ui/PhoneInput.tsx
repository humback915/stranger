"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface PhoneInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  error?: string;
  onChange?: (value: string) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ error, onChange, value, ...props }, ref) => {
    const formatPhone = (input: string) => {
      const digits = input.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    };

    return (
      <div className="w-full">
        <div className="flex items-center gap-2">
          <span className="shrink-0 rounded-lg bg-stranger-mid px-3 py-3 text-sm text-stranger-light">
            +82
          </span>
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              onChange?.(formatted);
            }}
            placeholder="010-1234-5678"
            className="w-full rounded-lg bg-stranger-mid px-4 py-3 text-stranger-light placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-stranger-accent"
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-stranger-accent">{error}</p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
