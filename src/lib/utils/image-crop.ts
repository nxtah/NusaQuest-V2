export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Motong gambar sesuai area crop (dari react-easy-crop's `onCropComplete`)
    lewat canvas, balikin sebagai File JPEG siap di-upload — dipake
    `CloudinaryUploadField` biar yang beneran naik ke Cloudinary itu hasil
    crop-nya, bukan file mentah apa adanya. */
export async function cropImageToFile(
  imageSrc: string,
  crop: PixelCrop,
  fileName: string,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung di browser ini');

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.92);
  });
  if (!blob) throw new Error('Gagal memproses hasil crop');

  return new File([blob], fileName, { type: 'image/jpeg' });
}
