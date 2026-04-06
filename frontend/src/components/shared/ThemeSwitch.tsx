import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "../../lib/utils";

const ThemeSwitch = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { resolvedTheme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setChecked(resolvedTheme === "dark"), [resolvedTheme]);

  const handleCheckedChange = useCallback(
    () => {
      const newChecked = !checked;
      setChecked(newChecked);
      setTheme(newChecked ? "dark" : "light");
    },
    [checked, setTheme],
  );

  if (!mounted) return null;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center h-9 w-20 cursor-pointer overflow-hidden rounded-full",
        className
      )}
      onClick={handleCheckedChange}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 h-full w-full rounded-full transition-colors",
          checked ? "bg-[var(--border)]" : "bg-[var(--border)]",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute left-1 h-7 w-7 rounded-full bg-[var(--background)] shadow z-10 transition-transform duration-300 ease-in-out",
          checked ? "translate-x-[44px]" : "translate-x-0"
        )}
      />

      <span className="pointer-events-none absolute left-2 inset-y-0 z-0 flex items-center justify-center">
        <SunIcon size={16} className={cn("transition-all duration-300 ease-out", checked ? "opacity-30" : "opacity-100 scale-110", "text-[var(--foreground)]")} />
      </span>

      <span className="pointer-events-none absolute right-2 inset-y-0 z-0 flex items-center justify-center">
        <MoonIcon size={16} className={cn("transition-all duration-300 ease-out", checked ? "opacity-100 scale-110" : "opacity-30", "text-[var(--foreground)]")} />
      </span>
    </div>
  );
};

export default ThemeSwitch;
