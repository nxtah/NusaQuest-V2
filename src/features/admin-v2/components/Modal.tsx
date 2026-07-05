'use client';
import {useState} from 'react';

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
  submitButtonText = 'Save',
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`${sizeClasses[size]} bg-[#1e2532] border border-white/20 rounded-2xl shadow-2xl p-8 relative backdrop-blur-xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {children}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="px-6 py-2.5 bg-gray-600/20 hover:bg-gray-600/40 text-gray-200 rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {(isSubmitting || isLoading) && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {submitButtonText}
            </button>
          </div>
        </form>
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
      <label className="block text-sm font-semibold text-gray-200 mb-2">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          placeholder={placeholder}
          defaultValue={value}
          required={required}
          rows={rows || 3}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      ) : type === 'select' ? (
        <select
          name={name}
          defaultValue={value || ''}
          required={required}
          className="w-full px-4 py-2.5 bg-white text-gray-900 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="" className="text-gray-500">Select {label.toLowerCase()}</option>
          {children}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          defaultValue={value}
          required={required}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      )}
    </div>
  );
}
