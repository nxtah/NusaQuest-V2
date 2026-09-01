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
    // Proxy Firebase Auth handler lewat domain app sendiri — authDomain
    // default (nusaquest-v2-bd551.firebaseapp.com) beda origin dari domain
    // app di Vercel, jadi login (popup ATAU redirect, dua-duanya) butuh
    // iframe/relay cross-origin ke authDomain itu buat balikin hasil login
    // ke tab app-nya. Browser modern (third-party storage partitioning di
    // Chrome, ITP di Safari) mem-block relay itu, bikin login diem-diem gak
    // pernah selesai. Rewrite ini bikin /__/auth/* di domain app sendiri
    // ke-proxy transparan ke backend Firebase asli — dari sudut pandang
    // browser, SEMUA request auth jadi same-origin, masalahnya ilang total.
    // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN juga HARUS diganti ke domain app
    // sendiri biar SDK-nya beneran manggil path ini (bukan domain asli).
    async rewrites() {
        return [
            {
                source: '/__/auth/:path*',
                destination: 'https://nusaquest-v2-bd551.firebaseapp.com/__/auth/:path*',
            },
        ];
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
