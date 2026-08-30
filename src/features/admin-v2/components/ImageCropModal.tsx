'use client';

import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { cropImageToFile } from '@/src/lib/utils/image-crop';
import '../admin-theme.css';

interface ImageCropModalProps {
  imageSrc: string;
  fileName: string;
  /** Rasio lebar/tinggi area crop — 4/5 buat foto anggota tim, 2490/984
      buat foto Informasi (sama kayak bingkai foto di halaman detailnya). */
  aspect: number;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}

export default function ImageCropModal({
  imageSrc,
  fileName,
  aspect,
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setIsProcessing(true);
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels, fileName);
      onConfirm(file);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="nq-admin-panel relative w-full max-w-lg rounded-[1.75rem] p-5 sm:p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-bauhaus text-lg sm:text-xl">Sesuaikan Gambar</h3>
          <p className="text-xs sm:text-sm font-semibold opacity-70 mt-1">
            Geser dan zoom buat atur bagian yang mau ditampilin, terus klik Pakai.
          </p>
        </div>

        <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-black/20">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold opacity-60 shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#f5a916]"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="nq-admin-btn-secondary px-5 py-2.5 rounded-full font-bold text-sm disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || !croppedAreaPixels}
            className="nq-admin-btn-primary px-5 py-2.5 rounded-full font-bold text-sm disabled:opacity-60"
          >
            {isProcessing ? 'Memproses...' : 'Pakai'}
          </button>
        </div>
      </div>
    </div>
  );
}
