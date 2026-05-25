"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    function onClose() {
      if (!busy) onCancel();
    }
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [busy, onCancel]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-dialog-title"
      className="w-full max-w-md rounded-[28px] border border-white/12 bg-panel/95 p-0 text-white shadow-glow backdrop:bg-black/72 backdrop:backdrop-blur-md"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`grid size-12 shrink-0 place-items-center rounded-2xl border ${
              tone === "danger"
                ? "border-red-300/30 bg-red-300/10 text-red-200"
                : "border-violet/30 bg-violet/10 text-violet"
            }`}
          >
            <AlertTriangle className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-dialog-title" className="text-xl font-black tracking-tight text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm font-medium leading-6 text-white/65">{body}</p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            disabled={busy}
            onClick={onCancel}
            className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/5 text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-45"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`inline-flex h-12 items-center justify-center rounded-2xl text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${
              tone === "danger"
                ? "bg-red-400 text-ink hover:bg-red-300"
                : "bg-violet text-ink shadow-glow hover:bg-[#a59cff]"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
