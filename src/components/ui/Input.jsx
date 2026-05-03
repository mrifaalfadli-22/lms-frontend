import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  error,
  touched,
  type = "text",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full text-left">
      <label className="text-sm text-gray-500 font-semibold ml-1 tracking-tight">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`
            w-full mt-1.5 px-4 py-3 
            bg-[#F3F6F6] 
            border border-gray-200
            rounded-lg 
            text-sm text-gray-700
            placeholder-gray-400/80
            outline-none
            transition-all duration-200
            focus:bg-white
            focus:ring-2 focus:ring-[#0E5C46]
            ${isPassword ? "pr-11" : ""}
            ${error && touched ? "ring-2 ring-red-400 bg-white" : ""}
          `}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-[calc(50%+3px)] -translate-y-1/2 text-gray-400 hover:text-[#0E5C46] transition-colors"
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {/* Tinggi tetap h-5 agar card tidak berubah ukuran saat error muncul */}
      <div className="h-5 mt-1 ml-1">
        {error && touched && (
          <p className="text-red-500 text-[11px] font-medium animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
