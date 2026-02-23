"use client";

import { createContext, useContext, useState, useCallback } from "react";

const AuditModalContext = createContext(null);

export function AuditModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const openModal = useCallback((plan = null) => {
    setSelectedPlan(plan);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelectedPlan(null);
  }, []);

  return (
    <AuditModalContext.Provider
      value={{ isOpen, selectedPlan, openModal, closeModal }}
    >
      {children}
    </AuditModalContext.Provider>
  );
}

export function useAuditModal() {
  const context = useContext(AuditModalContext);
  if (!context) {
    throw new Error("useAuditModal must be used within AuditModalProvider");
  }
  return context;
}
