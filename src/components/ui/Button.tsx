import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "fill" | "outline" | "ghost" | "primary" | "secondary" | "danger";
  colorScheme?: "gold" | "navy";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  showArrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "fill",
      colorScheme = "gold",
      size = "md",
      loading = false,
      showArrow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

    const variants = {
      fill: {
        gold:
          "bg-[#A47C3B] text-white hover:bg-[#8B6929] focus:bg-[#7A5C24] focus:ring-[#A47C3B]/50 disabled:bg-[#D7C7A3] disabled:text-gray-400",
        navy:
          "bg-[#083262] text-white hover:bg-[#062652] focus:ring-[#083262]/50",
      },
      outline: {
        gold:
          "border-2 border-[#A47C3B] bg-transparent text-[#A47C3B] hover:bg-[#A47C3B]/10 hover:border-[#8B6929] hover:text-[#8B6929] focus:border-[#7A5C24] focus:text-[#7A5C24] focus:ring-[#A47C3B]/30 disabled:border-[#D7C7A3] disabled:text-gray-400",
        navy:
          "border-2 border-[#083262] bg-transparent text-[#083262] hover:bg-[#083262]/10 focus:ring-[#083262]/30 disabled:border-[#D7C7A3] disabled:text-gray-400",
      },
      ghost: {
        gold:
          "bg-transparent text-[#A47C3B] hover:bg-[#A47C3B]/10 hover:text-[#8B6929] focus:text-[#7A5C24] focus:ring-[#A47C3B]/30 disabled:text-gray-400",
        navy:
          "bg-transparent text-[#083262] hover:bg-[#083262]/10 focus:ring-[#083262]/30 disabled:text-gray-400",
      },
    };

    const sizes = {
      sm: "px-4 py-2 text-sm gap-1.5",
      md: "px-6 py-2.5 text-base gap-2",
      lg: "px-8 py-3 text-lg gap-2",
    };

    const resolvedVariant =
      variant === "primary"
        ? "fill"
        : variant === "secondary"
          ? "outline"
          : variant === "danger"
            ? "fill"
            : variant;
    const resolvedScheme =
      variant === "danger" ? "navy" : colorScheme;
    const dangerOverride =
      variant === "danger"
        ? "bg-red-600 hover:bg-red-700 focus:ring-red-500/50 text-white border-0"
        : "";
    const variantStyles =
      variant === "danger"
        ? dangerOverride
        : variants[resolvedVariant as keyof typeof variants]?.[
            resolvedScheme as keyof (typeof variants)["fill"]
          ] ?? variants.fill.gold;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
        {showArrow && variant !== "danger" && !loading && (
          <ArrowRight className="h-4 w-4 shrink-0" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
