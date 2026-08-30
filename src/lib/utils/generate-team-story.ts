// Template dibuat manual sama user (di public/images/twibbon-nusaquest.png),
// beneran punya alpha channel asli (bukan checkerboard yang di-flatten kayak
// versi sebelumnya) — jadi tinggal taro foto DI BELAKANG template, lalu
// template digambar di atasnya; bagian yang transparan otomatis nampilin
// foto, bagian yang opaque (papan kayu, tangga+ular, dst) otomatis numpang
// di depan foto tanpa perlu trik masking apa pun.
const TEMPLATE_SRC = '/images/twibbon-nusaquest.png';
const TEMPLATE_W = 941;
const TEMPLATE_H = 1672;

// Kotak yang nutupin PENUH area transparan template (dites manual per-pixel
// biar gak nyisain celah hitam) — boleh sedikit lebih gede dari lubang
// aslinya karena kelebihannya bakal ketutup pixel opaque template di atasnya.
const PHOTO_RECT = { x: 45, y: 115, w: 785, h: 1030 };

// Output di-upscale dari resolusi native biar hasilnya lega buat story
// (Instagram nyaranin minimal ~1080 lebar).
const OUTPUT_SCALE = 1080 / TEMPLATE_W;

export interface TeamStoryInput {
  name: string;
  role: string;
  photoURL: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal memuat gambar: ${src}`));
    img.src = src;
  });
}

/** object-fit: cover — isi penuh box-nya, crop bagian tengah kalau rasio
    foto beda dari box (dites cocok buat foto potret 4:5 khas Credit). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
) {
  const boxRatio = boxW / boxH;
  const imgRatio = img.width / img.height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, boxX, boxY, boxW, boxH);
}

async function ensureFontsReady() {
  try {
    await Promise.all([
      document.fonts.load('400 90px Bauhaus'),
      document.fonts.load('400 46px Bauhaus'),
    ]);
    await document.fonts.ready;
  } catch {
    // Kalau gagal load (browser lama/gak dukung Font Loading API), tetep
    // lanjut gambar — bakal fallback ke font sistem, gak fatal.
  }
}

/** Teks "3D bubble" gaya lettering yang templatenya sendiri udah pake
    (liat "OFFICIAL TEAM"/"NUSA QUEST") — shadow gelap di belakang, outline
    coklat tebal, terus fill gradient emas dari terang ke gelap biar keliatan
    nonjol/timbul, bukan teks flat biasa. */
function drawGoldBubbleText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSizePx: number,
  outlineWidth: number,
) {
  const halfHeight = fontSizePx * 0.38;

  // Shadow — dorong ke bawah-kanan dikit biar ada kesan timbul/3D.
  ctx.save();
  ctx.translate(4, 6);
  ctx.fillStyle = 'rgba(74, 35, 10, 0.55)';
  ctx.fillText(text, x, y);
  ctx.restore();

  // Outline coklat tebal.
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = '#5a3400';
  ctx.lineWidth = outlineWidth;
  ctx.strokeText(text, x, y);

  // Fill gradient emas terang -> kuning tua, ngikutin tinggi teksnya.
  const gradient = ctx.createLinearGradient(0, y - halfHeight, 0, y + halfHeight);
  gradient.addColorStop(0, '#fff7c7');
  gradient.addColorStop(0.55, '#ffd23f');
  gradient.addColorStop(1, '#f5a916');
  ctx.fillStyle = gradient;
  ctx.fillText(text, x, y);
}

/**
 * Tempel foto anggota tim di belakang template twibbon (9:16) yang dibuat
 * manual, lalu tulis nama+role polos (gak pake card/background) di pojok
 * kanan bawah foto dengan sedikit rotasi — dipanggil dari tombol "Bagikan
 * ke Story" di CreditMemberModal. Templatenya sendiri gak disentuh sama
 * sekali, cuma digambar apa adanya di atas foto.
 */
export async function generateTeamStoryImage({ name, role, photoURL }: TeamStoryInput): Promise<Blob> {
  await ensureFontsReady();

  const [template, photo] = await Promise.all([
    loadImage(TEMPLATE_SRC),
    loadImage(photoURL),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(TEMPLATE_W * OUTPUT_SCALE);
  canvas.height = Math.round(TEMPLATE_H * OUTPUT_SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas tidak didukung di browser ini');

  ctx.scale(OUTPUT_SCALE, OUTPUT_SCALE);

  // 1) Foto anggota tim dulu, DI BELAKANG — nutupin penuh area yang bakal
  //    transparan di template.
  drawCover(ctx, photo, PHOTO_RECT.x, PHOTO_RECT.y, PHOTO_RECT.w, PHOTO_RECT.h);

  // 2) Template di atasnya, apa adanya — bagian transparannya nampilin foto,
  //    bagian opaque-nya (bingkai, papan kayu, tangga+ular, dst) otomatis
  //    numpang di depan foto.
  ctx.drawImage(template, 0, 0, TEMPLATE_W, TEMPLATE_H);

  // 3) Nama + role — teks "3D bubble" gradient emas (gaya sama kayak
  //    "OFFICIAL TEAM" di templatenya), rata kanan, di pojok kanan-bawah
  //    foto (dinaikkan & digeser ke kiri biar gak ketutup elemen bawah),
  //    dengan sedikit rotasi.
  const anchorX = PHOTO_RECT.x + PHOTO_RECT.w - 130;
  const anchorY = PHOTO_RECT.y + PHOTO_RECT.h - 290;

  ctx.save();
  ctx.translate(anchorX, anchorY);
  ctx.rotate((-6 * Math.PI) / 180);
  ctx.textAlign = 'right';

  ctx.font = '400 90px Bauhaus, sans-serif';
  drawGoldBubbleText(ctx, name.toUpperCase(), 0, 0, 90, 7);

  ctx.font = '400 46px Bauhaus, sans-serif';
  drawGoldBubbleText(ctx, role.toUpperCase(), 0, 62, 46, 5);

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gagal membuat gambar story'));
    }, 'image/png');
  });
}
