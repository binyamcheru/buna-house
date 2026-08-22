"use client";

export function Overlay({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`overlay ${show ? "overlay-show" : ""}`}
      onClick={onClose}
      aria-hidden="true"
    />
  );
}