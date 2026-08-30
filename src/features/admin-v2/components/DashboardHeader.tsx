interface DashboardHeaderProps {
  activeMenu: string;
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  pertanyaan: { title: 'Pertanyaan & Jawaban', subtitle: 'Tambah, edit, atau hapus soal untuk NusaCard dan Ular Tangga.' },
  informasi: { title: 'Informasi', subtitle: 'Kelola konten halaman Informasi.' },
  kota: { title: 'Kota & Provinsi', subtitle: 'Kelola daftar destinasi untuk peta permainan.' },
  credit: { title: 'Credit', subtitle: 'Kelola daftar anggota tim yang tampil di halaman Credit.' },
};

export default function DashboardHeader({ activeMenu }: DashboardHeaderProps) {
  const copy = TITLES[activeMenu] ?? TITLES.pertanyaan;
  return (
    <div className="nq-admin-header mb-4 sm:mb-6 lg:mb-8 p-5 sm:p-6 rounded-[1.75rem]">
      <h2 className="font-bauhaus text-xl sm:text-2xl lg:text-3xl tracking-wide">
        {copy.title}
      </h2>
      <p className="mt-1.5 text-sm sm:text-base font-semibold opacity-70">
        {copy.subtitle}
      </p>
    </div>
  );
}
