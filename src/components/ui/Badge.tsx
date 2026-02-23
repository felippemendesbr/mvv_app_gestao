interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
}: BadgeProps) {
  const variants = {
    success:
      "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/50",
    warning:
      "bg-amber-50 text-[#8B6929] border-[#D7C7A3] dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-700/50",
    error:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/50",
    info:
      "bg-[#083262]/25 !text-black border-[#083262]/60 dark:bg-[#6B9BD1]/20 dark:!text-[#D7C7A3] dark:border-[#6B9BD1]/40",
    default:
      "bg-[#EDE6D6] text-[#242D3F] border-[#D7C7A3] dark:bg-[var(--muted)] dark:text-[var(--foreground)] dark:border-[var(--border)]",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
