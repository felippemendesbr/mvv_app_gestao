import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  helperText?: string;
  errorText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      error = false,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={`
              w-full px-4 py-3 font-serif text-[#242D3F] bg-white
              border rounded-lg transition-colors
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-[#A47C3B]/30 focus:border-[#A47C3B]
              disabled:bg-[#F5F2EB] disabled:cursor-not-allowed
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${
                error
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                  : "border-[#D7C7A3]"
              }
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                error ? "text-red-500" : "text-emerald-600"
              }`}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}
        {errorText && error && (
          <p className="mt-1.5 text-xs text-red-600 font-medium">{errorText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
