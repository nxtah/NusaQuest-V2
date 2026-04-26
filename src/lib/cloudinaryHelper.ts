// Helper for Cloudinary integration using next-cloudinary
import { CldImageProps } from 'next-cloudinary';

export function getCloudinaryUrl(publicId: string, options?: Partial<CldImageProps>): string {
  // Basic URL builder for Cloudinary assets
  // You can expand this for transformations, etc.
  const baseUrl = 'https://res.cloudinary.com/dprxjzfxp/image/upload/';
  // Add transformation string if needed
  // Example: options?.width, options?.height, etc.
  // For advanced usage, use next-cloudinary's CldImage component
  return `${baseUrl}${publicId}`;
}

// Example usage:
// getCloudinaryUrl('NQM4_1_dkiuuv.webp')
