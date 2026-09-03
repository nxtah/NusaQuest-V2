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
        // CSP ini SENGAJA masih pake 'unsafe-inline'/'unsafe-eval' di
        // script-src — bikin nonce yang bener butuh middleware.ts (baca per-
        // request nonce, suntik ke <script> tag), yang app ini belum punya
        // (lihat CLAUDE.md — proteksi route masih murni client-side). Tanpa
        // itu, CSP ketat beneran bakal ngeblok script inline bootstrap
        // Next.js sendiri. Ini baseline yang jauh lebih baik daripada TANPA
        // CSP sama sekali (yang sebelumnya), bukan CSP sempurna — nge-block
        // origin liar/script pihak ketiga yang gak dikenal, sambil tetep
        // ngebolehin origin yang app ini BENERAN pake (Firebase, Cloudinary,
        // avatar Google).
        const csp = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://lh3.googleusercontent.com https://firebasestorage.googleapis.com",
            "font-src 'self' data:",
            "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://res.cloudinary.com https://api.cloudinary.com https://accounts.google.com",
            "frame-src 'self' https://accounts.google.com https://*.firebaseapp.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
        ].join('; ');

        return [
            {
                // Berlaku ke semua route — auth (login Google, session admin)
                // gak boleh kena clickjacking/framing, dan gak ada alasan
                // bagian app manapun butuh dibuka di dalam iframe orang lain.
                source: '/:path*',
                headers: [
                    { key: 'Content-Security-Policy', value: csp },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    ...(process.env.NODE_ENV === 'production'
                        ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
                        : []),
                ],
            },
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
