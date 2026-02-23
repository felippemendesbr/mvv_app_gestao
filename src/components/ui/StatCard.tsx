import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-[#A47C3B]",
}: StatCardProps) {
  return (
    <div className="bg-[var(--card)] rounded-[var(--radius-card)] border border-[var(--border)] shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]/70">{title}</p>
          <p className="text-3xl font-bold text-[var(--foreground)] mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 font-medium ${
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-[var(--muted)] ${iconColor} dark:!text-[#D7C7A3]`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
