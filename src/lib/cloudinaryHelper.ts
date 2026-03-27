// Helper for Cloudinary integration using next-cloudinary
import { CldImageProps } from 'next-cloudinary';

export function getCloudinaryUrl(publicId: string, options?: Partial<CldImageProps>): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  }

  const transforms: string[] = [];
  if (options?.width) {
    transforms.push(`w_${options.width}`);
  }
  if (options?.height) {
    transforms.push(`h_${options.height}`);
  }
  if (options?.crop) {
    transforms.push(`c_${options.crop}`);
  }

  const transformPath = transforms.length > 0 ? `${transforms.join(',')}/` : '';

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformPath}${publicId}`;
}

// Example usage:
// getCloudinaryUrl('NQM4_1_dkiuuv.webp')
