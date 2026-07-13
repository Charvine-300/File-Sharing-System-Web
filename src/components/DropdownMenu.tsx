import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: "left" | "right";
  menuClassName?: string;
}

// Renders the menu into a portal at document.body, positioned via getBoundingClientRect
// off the trigger. This is what keeps it from being clipped by a scrollable/overflow-hidden
// table wrapper, and lets it flip upward when there isn't room below (e.g. the last row
// of a table near the bottom of the viewport).
export default function DropdownMenu({
  trigger,
  children,
  align = "right",
  menuClassName = "w-44",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    setPosition(null);
  }

  function toggle() {
    setOpen((prev) => !prev);
  }

  useLayoutEffect(() => {
    if (!open) return;

    const triggerEl = triggerRef.current;
    const menuEl = menuRef.current;
    if (!triggerEl || !menuEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const menuRect = menuEl.getBoundingClientRect();

    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const openUpward =
      spaceBelow < menuRect.height + 8 && triggerRect.top > menuRect.height + 8;

    const top = openUpward
      ? triggerRect.top - menuRect.height - 4
      : triggerRect.bottom + 4;

    const left =
      align === "right"
        ? triggerRect.right - menuRect.width
        : triggerRect.left;

    setPosition({ top, left: Math.max(8, left) });
  }, [open, align]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      close();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <>
      <div ref={triggerRef} className="inline-block">
        {trigger({ open, toggle })}
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              visibility: position ? "visible" : "hidden",
            }}
            className={`z-50 rounded-md border border-border bg-card py-1 shadow-lg ${menuClassName}`}
          >
            {children({ close })}
          </div>,
          document.body
        )}
    </>
  );
}
