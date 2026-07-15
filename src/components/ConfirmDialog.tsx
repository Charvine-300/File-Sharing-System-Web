import { useEffect, useRef, useState, type ReactNode } from "react";
import Modal from "./Modal";
import Spinner from "./Spinner";

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  async function handleConfirm() {
    setSubmitting(true);
    await onConfirm();
    // onConfirm typically closes this dialog on success (unmounting it), so
    // guard against setting state on an unmounted component afterwards.
    if (mountedRef.current) setSubmitting(false);
  }

  return (
    <Modal title={title} onClose={onCancel}>
      <div className="text-sm text-muted-foreground">{message}</div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="btn outline-btn mt-0 flex-1"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting}
          className={`btn mt-0 flex-1 inline-flex items-center justify-center gap-2 ${
            variant === "danger"
              ? "bg-danger text-danger-foreground hover:ring-4 hover:ring-danger/30"
              : "primary-btn normal-btn"
          }`}
        >
          {submitting && <Spinner size="sm" variant="on-primary" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
