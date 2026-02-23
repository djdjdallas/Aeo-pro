"use client";

import { AuditModalProvider } from "@/components/AuditModalContext";
import AuditModal from "@/components/AuditModal";

export default function Providers({ children }) {
  return (
    <AuditModalProvider>
      {children}
      <AuditModal />
    </AuditModalProvider>
  );
}
