# 🎨 Font Setup Guide - Bauhaus

## Cara Kerja Font Setup

Font **Bauhaus** sudah di-setup otomatis di project ini. Berikut penjelasannya:

### File yang Terlibat:

1. **`public/fonts/Bauhaus.otf`** - Font file original
2. **`src/styles/fonts.css`** - File yang mendefinisikan font via `@font-face`
3. **`src/globals.css`** - Import `fonts.css` agar tersedia global

---

## Cara Menggunakan Font

### Option 1: Inline CSS (Paling Simple)

```tsx
export default function MyComponent() {
  return (
    <h1 style={{ fontFamily: 'Bauhaus' }}>
      Hello World
    </h1>
  );
}
```

### Option 2: CSS Class (Recommended)

Buat CSS class di file component atau global:

```css
.heading-bauhaus {
  font-family: 'Bauhaus';
  font-size: 32px;
  font-weight: normal;
}
```

Kemudian gunakan:

```tsx
export default function MyComponent() {
  return (
    <h1 className="heading-bauhaus">
      Hello World
    </h1>
  );
}
```

### Option 3: Tailwind CSS (Jika sudah dikonfigurasi)

Update `tailwind.config.js` / `tailwind.config.ts`:

```js
module.exports = {
  theme: {
    fontFamily: {
      bauhaus: ['Bauhaus', 'sans-serif'],
    },
  },
}
```

Kemudian gunakan di component:

```tsx
<h1 className="font-bauhaus">Hello World</h1>
```

---

## Menambah Font Baru

Jika ingin tambah font lain, cukup:

1. **Copy font file ke `public/fonts/`** (contoh: `public/fonts/MontserratBold.otf`)

2. **Tambah ke `src/styles/fonts.css`**:

```css
@font-face {
  font-family: 'MontserratBold';
  src: url('/fonts/MontserratBold.otf') format('opentype');
  font-weight: bold;
  font-style: normal;
  font-display: swap;
}
```

3. **Done!** Font langsung bisa dipakai di mana saja.

---

## Tips

- ✅ Gunakan `font-display: swap` untuk performa lebih baik
- ✅ Font otomatis load dari public folder, tidak perlu setup kompleks
- ✅ Semua orang dalam tim bisa langsung pakai tanpa import berulang
