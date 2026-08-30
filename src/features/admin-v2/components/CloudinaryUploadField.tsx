'use client';

import { useRef, useState } from 'react';
import '../admin-theme.css';

interface CloudinaryUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  /** Folder Cloudinary tujuan, mis. `nusaquest/informasi` atau `nusaquest/credits`. */
  folder: string;
  required?: boolean;
}

interface SignatureResponse {
  ok: boolean;
  signature?: string;
  timestamp?: number;
  folder?: string;
  cloudName?: string;
  apiKey?: string;
  error?: string;
}

/**
 * Upload gambar langsung dari admin panel ke Cloudinary — sebelumnya admin
 * harus upload manual ke Cloudinary dulu terus tempel URL-nya sendiri.
 * Alurnya: minta signature dari `/api/upload/signature` (server, admin-only,
 * cookie sesi ke-kirim otomatis karena same-origin), lalu POST file-nya
 * LANGSUNG ke Cloudinary pakai signature itu (API secret gak pernah nyampe
 * browser). Hasil `secure_url`-nya yang disimpan ke Firestore.
 */
export default function CloudinaryUploadField({
  label,
  value,
  onChange,
  folder,
  required = false,
}: CloudinaryUploadFieldProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);
    setIsUploading(true);

    try {
      const sigRes = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      const sig = (await sigRes.json()) as SignatureResponse;
      if (!sig.ok || !sig.signature || !sig.cloudName || !sig.apiKey || !sig.timestamp) {
        throw new Error(sig.error || 'Gagal mengambil signature upload.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder ?? folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );
      const uploaded = (await uploadRes.json()) as { secure_url?: string; error?: { message: string } };
      if (!uploadRes.ok || !uploaded.secure_url) {
        throw new Error(uploaded.error?.message || 'Upload ke Cloudinary gagal.');
      }

      onChange(uploaded.secure_url);
      setPreview(uploaded.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal.');
      setPreview(value);
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localPreviewUrl);
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-[#4a2a1a] mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="nq-admin-upload-btn shrink-0 h-24 w-24 rounded-2xl overflow-hidden flex items-center justify-center disabled:opacity-60"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-[#8b5e2a] text-xs font-semibold px-2 text-center">
              {isUploading ? '...' : 'Pilih gambar'}
            </span>
          )}
        </button>

        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className="nq-admin-btn-secondary px-4 py-2 rounded-full text-sm font-bold disabled:opacity-60"
          >
            {isUploading ? 'Mengunggah...' : preview ? 'Ganti gambar' : 'Unggah gambar'}
          </button>
          {error && <p className="mt-2 text-xs text-red-600 font-semibold">{error}</p>}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
