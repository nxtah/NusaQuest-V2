import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
        {
            protocol: 'https',
            hostname: 'res.cloudinary.com',
            pathname: '/**',
        },
        {
            protocol: 'https',
            hostname: 'images.unsplash.com',
            pathname: '/**',
        },
        {
            // Foto profil Google (Sign-In with Google)
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
            pathname: '/**',
        },
        {
            // Firebase Storage (foto yang di-upload user)
            protocol: 'https',
            hostname: 'firebasestorage.googleapis.com',
            pathname: '/**',
        },
        ],
    },
};

export default nextConfig;
