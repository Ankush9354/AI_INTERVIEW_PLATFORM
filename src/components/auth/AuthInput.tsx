import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { HiEye, HiEyeOff } from "react-icons/hi";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
}

const AuthInput = ({
  label,
  error,
  registration,
  type = "text",
  ...props
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-2 block font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          {...registration}
          {...props}
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition ${
            error
              ? "border-red-500"
              : "border-slate-300 focus:border-blue-500"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
          >
            {showPassword ? (
              <HiEyeOff size={22} />
            ) : (
              <HiEye size={22} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default AuthInput;