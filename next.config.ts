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
        // URL Cloudinary di app ini sudah versioned (ada "v1774..." di path),
        // jadi aman di-cache lama — kalau asset-nya ganti, URL-nya ikut ganti.
        // Default Next.js cuma 60 detik; 1 tahun di sini gak berisiko bikin
        // user kejebak lihat gambar basi.
        minimumCacheTTL: 31536000,
    },
    async headers() {
        return [
            {
                // Font & logo statis di /public — jarang/gak pernah berubah,
                // browser cache 7 hari (bukan "immutable" selamanya) biar
                // kalau suatu saat file-nya diganti manual, user gak kejebak
                // kelamaan.
                source: '/fonts/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
                ],
            },
            {
                source: '/icons/:path*',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
                ],
            },
        ];
    },
};

export default nextConfig;
