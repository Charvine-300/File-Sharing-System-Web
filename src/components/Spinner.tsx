interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "on-primary" | "muted";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

// Keeping each variant as one indivisible class string (rather than composing
// e.g. "border-primary" + a caller-supplied color class) avoids relying on
// Tailwind's utility ordering to resolve which border-color utility wins.
const VARIANT_CLASSES: Record<NonNullable<SpinnerProps["variant"]>, string> = {
  primary: "border-primary border-t-transparent",
  "on-primary": "border-primary-foreground border-t-transparent",
  muted: "border-muted-foreground border-t-transparent",
};

export default function Spinner({
  size = "md",
  variant = "primary",
  className = "",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block shrink-0 animate-spin rounded-full ${SIZE_CLASSES[size]} ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
