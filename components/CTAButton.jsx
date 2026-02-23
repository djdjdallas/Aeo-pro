"use client";

import { useAuditModal } from "@/components/AuditModalContext";

export default function CTAButton({ children, className, plan }) {
  const { openModal } = useAuditModal();

  return (
    <button onClick={() => openModal(plan)} className={className}>
      {children}
    </button>
  );
}
