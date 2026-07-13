interface AvatarProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: "sm" | "md";
}

export default function Avatar({
  src,
  firstName,
  lastName,
  size = "md",
}: AvatarProps) {
  const dimension = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className={`${dimension} shrink-0 rounded-full border border-border object-cover`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full border border-border bg-accent font-medium text-accent-foreground`}
    >
      {initials}
    </div>
  );
}
