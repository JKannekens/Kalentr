import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Classes for the wrapper div (e.g. widths in inline layouts). */
  wrapperClassName?: string;
}

/**
 * Native <select> that actually honors our input styling. Browsers keep their
 * OS chrome on selects unless appearance-none is set, which in turn removes
 * the arrow — so this pairs the reset with a custom chevron.
 */
export function NativeSelect({
  className,
  wrapperClassName,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select {...props} className={cn(className, "appearance-none pr-8")}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
}
