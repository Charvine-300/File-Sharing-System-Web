import { createPortal } from "react-dom";
import { SidebarNav } from "./Sidebar";
import BrandLogo from "./BrandLogo";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

// Stays mounted at all times (rather than the old `if (!open) return null`) so
// closing can actually transition instead of snapping out of existence — only
// the transform/opacity toggle, which CSS can animate.
export default function MobileNav({ open, onClose }: MobileNavProps) {
  return createPortal(
    <div
      className={`modal-overlay fixed inset-0 z-30 transition-opacity duration-300 ease-out lg:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        className={`card h-full w-64 max-w-[80vw] overflow-y-auto rounded-none border-r border-border p-4 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <BrandLogo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>,
    document.body
  );
}
