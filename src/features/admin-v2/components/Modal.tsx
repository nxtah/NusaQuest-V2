'use client';
import {useState} from 'react';
import '../admin-theme.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isLoading?: boolean;
  children: React.ReactNode;
  submitButtonText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({
  isOpen,
  title,
  onClose,
  onSubmit,
  isLoading = false,
  children,
  submitButtonText = 'Simpan',
  size = 'md',
}: ModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-full max-w-sm',
    md: 'w-full max-w-lg',
    lg: 'w-full max-w-3xl',
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    setIsSubmitting(true);
    onSubmit(data)
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div
      className="nq-admin-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`nq-admin-modal-frame ${sizeClasses[size]} rounded-[1.75rem] p-2 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nq-admin-modal-inner rounded-[1.4rem] p-6 sm:p-8 max-h-[85vh] overflow-y-auto nq-admin-scrollbar">
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 p-2 rounded-full text-[#4a2a1a]/60 hover:text-[#4a2a1a] hover:bg-black/5 transition-colors"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="font-bauhaus text-xl sm:text-2xl mb-6 pr-8 tracking-wide">{title}</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {children}

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-5 border-t border-[#8b5e2a]/20">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isLoading}
                className="nq-admin-btn-secondary px-6 py-2.5 rounded-full font-bold text-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="nq-admin-btn-primary px-6 py-2.5 rounded-full font-bold text-sm flex items-center gap-2"
              >
                {(isSubmitting || isLoading) && (
                  <div className="w-4 h-4 border-2 border-[#4a2a1a]/30 border-t-[#4a2a1a] rounded-full animate-spin" />
                )}
                {submitButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  rows?: number;
  children?: React.ReactNode;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  required = false,
  rows,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          placeholder={placeholder}
          defaultValue={value}
          required={required}
          rows={rows || 3}
          className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
        />
      ) : type === 'select' ? (
        <select
          name={name}
          defaultValue={value || ''}
          required={required}
          className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
        >
          <option value="">Pilih {label.toLowerCase()}</option>
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          defaultValue={value}
          required={required}
          className="nq-admin-field w-full px-4 py-2.5 rounded-xl"
        />
      )}
    </div>
  );
}
