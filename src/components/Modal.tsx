import type { MouseEvent, ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  return (
    <div
      className="modal-overlay fixed inset-0 z-20 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div className="card w-full max-w-md p-6" onClick={stopPropagation}>
        <div className="mb-4 flex items-center justify-between">
          <h2>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
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
        {children}
      </div>
    </div>
  );
}
