"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle } from "lucide-react";
import { useAuditModal } from "@/components/AuditModalContext";

const BUSINESS_TYPES = [
  "HVAC / Plumbing",
  "Roofing",
  "Dentist",
  "Law Firm",
  "Med Spa",
  "Contractor",
  "Other",
];

const SPEND_RANGES = [
  "Under $500",
  "$500 - $1,000",
  "$1,000 - $3,000",
  "$3,000+",
];

const initialForm = {
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  business_type: "",
  location: "",
  marketing_spend: "",
};

function validate(form) {
  const errors = {};
  if (!form.business_name.trim()) errors.business_name = "Business name is required";
  if (!form.contact_name.trim()) errors.contact_name = "Your name is required";
  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email address";
  }
  if (!form.business_type) errors.business_type = "Select a business type";
  if (!form.location.trim()) errors.location = "City & state is required";
  if (!form.marketing_spend) errors.marketing_spend = "Select a spend range";
  return errors;
}

export default function AuditModal() {
  const { isOpen, selectedPlan, closeModal } = useAuditModal();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");
  const firstInputRef = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus first input after animation
      setTimeout(() => firstInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && isOpen) closeModal();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeModal]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setErrors({});
      setStatus("idle");
      setServerError("");
    }
  }, [isOpen]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setStatus("submitting");
    setServerError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          plan: selectedPlan || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={closeModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {status === "success" ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              You&apos;re In!
            </h3>
            <p className="text-gray-400 mb-6">
              We&apos;ll send your free AI Visibility Audit within 24 hours.
              Check your inbox!
            </p>
            <button
              onClick={closeModal}
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white font-medium px-6 py-3 rounded-xl transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              Get Your Free AI Visibility Audit
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Tell us about your business and we&apos;ll show you exactly where
              you stand with AI recommendations.
            </p>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-4">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Business Name */}
              <Field
                label="Business Name"
                name="business_name"
                type="text"
                placeholder="e.g. Smith Plumbing"
                value={form.business_name}
                onChange={handleChange}
                error={errors.business_name}
                ref={firstInputRef}
                required
              />

              {/* Contact Name */}
              <Field
                label="Your Name"
                name="contact_name"
                type="text"
                placeholder="e.g. John Smith"
                value={form.contact_name}
                onChange={handleChange}
                error={errors.contact_name}
                required
              />

              {/* Email */}
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="john@smithplumbing.com"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              {/* Phone */}
              <Field
                label="Phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
              />

              {/* Business Type */}
              <SelectField
                label="Business Type"
                name="business_type"
                value={form.business_type}
                onChange={handleChange}
                error={errors.business_type}
                options={BUSINESS_TYPES}
                placeholder="Select your industry"
                required
              />

              {/* City & State */}
              <Field
                label="City & State"
                name="location"
                type="text"
                placeholder="e.g. Austin, TX"
                value={form.location}
                onChange={handleChange}
                error={errors.location}
                required
              />

              {/* Marketing Spend */}
              <SelectField
                label="Current Monthly Marketing Spend"
                name="marketing_spend"
                value={form.marketing_spend}
                onChange={handleChange}
                error={errors.marketing_spend}
                options={SPEND_RANGES}
                placeholder="Select a range"
                required
              />

              {selectedPlan && (
                <p className="text-sm text-gray-500">
                  Selected plan: <span className="text-[#3b82f6]">{selectedPlan}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="cta-glow w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Get My Free Audit"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

import { forwardRef } from "react";

const Field = forwardRef(function Field(
  { label, name, type, placeholder, value, onChange, error, required },
  ref
) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#0a0a0a] border ${
          error ? "border-red-500" : "border-[#1f1f1f]"
        } text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#3b82f6] transition-colors`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
});

function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
  placeholder,
  required,
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#0a0a0a] border ${
          error ? "border-red-500" : "border-[#1f1f1f]"
        } text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#3b82f6] transition-colors appearance-none`}
      >
        <option value="" disabled className="text-gray-600">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
