/**
 * Seed script — populates Firestore with initial development data.
 * Run: npx ts-node --compiler-options '{"module":"commonjs","moduleResolution":"node"}' scripts/seed-firestore.ts
 *
 * Prerequisites (either one):
 *   1. FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY
 *      in .env.local (same vars used by src/lib/firebase/admin.ts)
 *   2. Service account key at scripts/service-account.json
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvLocal(): Record<string, string> {
  const p = path.resolve(__dirname, '..', '.env.local');
  const env: Record<string, string> = {};
  if (!fs.existsSync(p)) return env;
  fs.readFileSync(p, 'utf-8')
    .split(/\r?\n/)
    .forEach((line) => {
      const m = line.match(/^([A-Z_0-9]+)=(.*)$/);
      if (m) env[m[1]] = m[2].replace(/^"|"$/g, '');
    });
  return env;
}

function loadServiceAccount(): { credential: ServiceAccount; projectId: string } {
  const env = { ...loadEnvLocal(), ...process.env } as Record<string, string | undefined>;

  if (env.FIREBASE_ADMIN_PROJECT_ID && env.FIREBASE_ADMIN_CLIENT_EMAIL && env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return {
      credential: {
        projectId: env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      projectId: env.FIREBASE_ADMIN_PROJECT_ID,
    };
  }

  const p = path.resolve(__dirname, 'service-account.json');
  if (!fs.existsSync(p)) {
    console.error(
      'Missing Firebase Admin credentials — set FIREBASE_ADMIN_PROJECT_ID/FIREBASE_ADMIN_CLIENT_EMAIL/FIREBASE_ADMIN_PRIVATE_KEY in .env.local, or create scripts/service-account.json',
    );
    process.exit(1);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(p, 'utf-8'));
  return { credential: serviceAccount, projectId: serviceAccount.project_id };
}

const { credential, projectId: PROJECT_ID } = loadServiceAccount();

const app = initializeApp({
  credential: cert(credential),
  projectId: PROJECT_ID,
});

const db = getFirestore(app);

// ====================
// Topik & Provinsi
// ====================

// 5 topik final — semua topik pakai daftar 38 provinsi yang sama sebagai region-nya.
const MAPS = [
  { name: 'Kuliner', icon: '🍜', description: 'Makanan & minuman khas 38 provinsi Indonesia', order: 1 },
  { name: 'Pariwisata', icon: '🏝️', description: 'Destinasi wisata darat & laut di 38 provinsi', order: 2 },
  { name: 'Sejarah & Legenda', icon: '📜', description: 'Kerajaan, tokoh, dan cerita rakyat tiap provinsi', order: 3 },
  { name: 'Budaya', icon: '🎭', description: 'Adat istiadat, rumah adat, tarian, dan tradisi', order: 4 },
  { name: 'Alam & Satwa', icon: '🦋', description: 'Taman nasional, satwa endemik, dan fenomena alam', order: 5 },
];

const OLD_MAP_IDS = ['daerah', 'bahari', 'pariwisata-darat', 'permainan-daerah'];

interface Province {
  code: string;
  name: string;
}

const PROVINCES: Province[] = [
  { code: 'ac', name: 'Aceh' },
  { code: 'su', name: 'Sumatera Utara' },
  { code: 'sb', name: 'Sumatera Barat' },
  { code: 'ri', name: 'Riau' },
  { code: 'ja', name: 'Jambi' },
  { code: 'ss', name: 'Sumatera Selatan' },
  { code: 'be', name: 'Bengkulu' },
  { code: 'la', name: 'Lampung' },
  { code: 'kr', name: 'Kepulauan Riau' },
  { code: 'bb', name: 'Bangka Belitung' },
  { code: 'jk', name: 'DKI Jakarta' },
  { code: 'jb', name: 'Jawa Barat' },
  { code: 'jt', name: 'Jawa Tengah' },
  { code: 'yo', name: 'DI Yogyakarta' },
  { code: 'jw', name: 'Jawa Timur' },
  { code: 'bn', name: 'Banten' },
  { code: 'ba', name: 'Bali' },
  { code: 'nb', name: 'Nusa Tenggara Barat' },
  { code: 'nt', name: 'Nusa Tenggara Timur' },
  { code: 'kb', name: 'Kalimantan Barat' },
  { code: 'kt', name: 'Kalimantan Tengah' },
  { code: 'ks', name: 'Kalimantan Selatan' },
  { code: 'ki', name: 'Kalimantan Timur' },
  { code: 'ku', name: 'Kalimantan Utara' },
  { code: 'sv', name: 'Sulawesi Utara' },
  { code: 'st', name: 'Sulawesi Tengah' },
  { code: 'sl', name: 'Sulawesi Selatan' },
  { code: 'sr', name: 'Sulawesi Tenggara' },
  { code: 'go', name: 'Gorontalo' },
  { code: 'sa', name: 'Sulawesi Barat' },
  { code: 'ma', name: 'Maluku' },
  { code: 'mu', name: 'Maluku Utara' },
  { code: 'pa', name: 'Papua' },
  { code: 'pb', name: 'Papua Barat' },
  { code: 'pt', name: 'Papua Tengah' },
  { code: 'pp', name: 'Papua Pegunungan' },
  { code: 'ps', name: 'Papua Selatan' },
  { code: 'pd', name: 'Papua Barat Daya' },
];

interface QA {
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

interface ProvinceQuestions {
  code: string;
  kuliner: QA;
  pariwisata: QA;
  sejarahLegenda: QA;
  budaya: QA;
  alamSatwa: QA;
}

// 1 soal per topik per provinsi (38 provinsi x 5 topik = 190 soal) — starter set,
// bisa ditambah lagi belakangan.
const PROVINCE_QUESTIONS: ProvinceQuestions[] = [
  {
    code: 'ac',
    kuliner: { text: 'Mie pedas dengan bumbu rempah khas Aceh dikenal sebagai?', options: ['Mie Aceh', 'Rendang', 'Gudeg', 'Pempek'], correctIndex: 0 },
    pariwisata: { text: 'Masjid ikon kota Banda Aceh yang jadi tujuan wisata religi adalah?', options: ['Masjid Raya Baiturrahman', 'Candi Borobudur', 'Tanah Lot', 'Danau Toba'], correctIndex: 0 },
    sejarahLegenda: { text: 'Aceh dulu pernah berjaya sebagai pusat kesultanan Islam bernama?', options: ['Kesultanan Aceh Darussalam', 'Kesultanan Mataram', 'Kesultanan Demak', 'Kesultanan Banten'], correctIndex: 0 },
    budaya: { text: 'Tarian yang dimainkan sambil duduk berbaris dan bertepuk tangan cepat, berasal dari Aceh, adalah?', options: ['Tari Saman', 'Tari Kecak', 'Tari Piring', 'Tari Jaipong'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional habitat orangutan Sumatera yang berada di Aceh adalah?', options: ['Gunung Leuser', 'Ujung Kulon', 'Komodo', 'Baluran'], correctIndex: 0 },
  },
  {
    code: 'su',
    kuliner: { text: 'Kue lapis legit berwarna kuning khas Medan dikenal sebagai?', options: ['Bika Ambon', 'Mie Aceh', 'Rendang', 'Papeda'], correctIndex: 0 },
    pariwisata: { text: 'Danau vulkanik terbesar di Asia Tenggara, Danau Toba, berada di provinsi?', options: ['Sumatera Utara', 'Sumatera Barat', 'Aceh', 'Riau'], correctIndex: 0 },
    sejarahLegenda: { text: 'Sisingamangaraja, pahlawan yang melawan kolonial Belanda, berasal dari suku?', options: ['Batak', 'Minangkabau', 'Melayu', 'Nias'], correctIndex: 0 },
    budaya: { text: 'Rumah adat berbentuk panggung dengan atap melengkung khas suku Batak disebut?', options: ['Rumah Bolon', 'Rumah Gadang', 'Rumah Joglo', 'Rumah Panjang'], correctIndex: 0 },
    alamSatwa: { text: 'Pulau di tengah Danau Toba yang jadi destinasi wisata terkenal adalah?', options: ['Pulau Samosir', 'Pulau Weh', 'Pulau Bintan', 'Pulau Belitung'], correctIndex: 0 },
  },
  {
    code: 'sb',
    kuliner: { text: 'Masakan daging bersantan yang dimasak berjam-jam hingga kering, aslinya dari?', options: ['Sumatera Barat (Minangkabau)', 'Sumatera Utara', 'Aceh', 'Riau'], correctIndex: 0 },
    pariwisata: { text: 'Menara jam ikon kota Bukittinggi yang terkenal adalah?', options: ['Jam Gadang', 'Monas', 'Menara Siger', 'Tugu Khatulistiwa'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan Pagaruyung, pusat adat Minangkabau, berlokasi di provinsi?', options: ['Sumatera Barat', 'Sumatera Utara', 'Riau', 'Jambi'], correctIndex: 0 },
    budaya: { text: 'Rumah adat beratap gonjong menyerupai tanduk kerbau khas Minangkabau disebut?', options: ['Rumah Gadang', 'Rumah Bolon', 'Rumah Joglo', 'Rumah Limas'], correctIndex: 0 },
    alamSatwa: { text: 'Lembah curam dengan tebing hijau yang terkenal di dekat Bukittinggi disebut?', options: ['Ngarai Sianok', 'Kawah Putih', 'Baluran', 'Kelimutu'], correctIndex: 0 },
  },
  {
    code: 'ri',
    kuliner: { text: 'Olahan ikan patin berkuah asam pedas jadi kuliner andalan provinsi?', options: ['Riau', 'Jambi', 'Sumatera Selatan', 'Lampung'], correctIndex: 0 },
    pariwisata: { text: 'Istana Siak Sri Indrapura, peninggalan kesultanan Melayu, berada di provinsi?', options: ['Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kesultanan Siak Sri Indrapura adalah kerajaan Melayu bersejarah yang berpusat di?', options: ['Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Riau'], correctIndex: 0 },
    budaya: { text: 'Tari pergaulan berirama gembira khas Melayu Riau disebut?', options: ['Tari Zapin', 'Tari Saman', 'Tari Piring', 'Tari Kecak'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional Tesso Nilo, habitat gajah Sumatera, berada di provinsi?', options: ['Riau', 'Jambi', 'Sumatera Selatan', 'Lampung'], correctIndex: 0 },
  },
  {
    code: 'ja',
    kuliner: { text: 'Olahan durian fermentasi yang jadi sambal khas Sumatera bagian tengah disebut?', options: ['Tempoyak', 'Rendang', 'Gulai', 'Pindang'], correctIndex: 0 },
    pariwisata: { text: 'Kompleks percandian Hindu-Buddha terluas di Indonesia, Candi Muaro Jambi, berada di provinsi?', options: ['Jambi', 'Sumatera Selatan', 'Riau', 'Jawa Tengah'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan Melayu kuno cikal bakal Jambi berpusat di tepi Sungai?', options: ['Batanghari', 'Musi', 'Kampar', 'Rokan'], correctIndex: 0 },
    budaya: { text: 'Pasar tradisional terkenal di kota Jambi yang jadi pusat perdagangan lama disebut?', options: ['Angso Duo', 'Pasar Baru', 'Pasar Terapung', 'Pasar Klewer'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional Kerinci Seblat, habitat harimau Sumatera, melintasi Jambi dan provinsi?', options: ['Sumatera Barat', 'Jawa Barat', 'Kalimantan Barat', 'Sulawesi Barat'], correctIndex: 0 },
  },
  {
    code: 'ss',
    kuliner: { text: 'Olahan ikan dan sagu berbentuk lonjong yang mendunia berasal dari kota?', options: ['Palembang', 'Medan', 'Padang', 'Pekanbaru'], correctIndex: 0 },
    pariwisata: { text: 'Jembatan ikon di atas Sungai Musi yang jadi landmark kota Palembang adalah?', options: ['Jembatan Ampera', 'Jembatan Barelang', 'Jembatan Suramadu', 'Jembatan Merah'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan maritim besar Sriwijaya berpusat di provinsi?', options: ['Sumatera Selatan', 'Sumatera Utara', 'Jambi', 'Riau'], correctIndex: 0 },
    budaya: { text: 'Tari penyambutan tamu kehormatan dengan properti tepak khas Palembang disebut?', options: ['Tari Gending Sriwijaya', 'Tari Piring', 'Tari Saman', 'Tari Zapin'], correctIndex: 0 },
    alamSatwa: { text: 'Sungai terpanjang di Pulau Sumatera, Sungai Musi, mengalir di provinsi?', options: ['Sumatera Selatan', 'Sumatera Utara', 'Riau', 'Jambi'], correctIndex: 0 },
  },
  {
    code: 'be',
    kuliner: { text: 'Ikan yang dibungkus daun talas dan dikukus lama, kuliner khas provinsi?', options: ['Bengkulu', 'Lampung', 'Jambi', 'Riau'], correctIndex: 0 },
    pariwisata: { text: 'Benteng peninggalan Inggris terbesar di Asia Tenggara, Benteng Marlborough, ada di kota?', options: ['Bengkulu', 'Padang', 'Medan', 'Palembang'], correctIndex: 0 },
    sejarahLegenda: { text: 'Bengkulu pernah jadi tempat pengasingan sang Proklamator?', options: ['Soekarno', 'Mohammad Hatta', 'Sutan Sjahrir', 'Tan Malaka'], correctIndex: 0 },
    budaya: { text: 'Bunga raksasa berbau busuk yang jadi ikon flora provinsi Bengkulu adalah?', options: ['Rafflesia arnoldii', 'Anggrek bulan', 'Bunga bangkai titan arum', 'Melati'], correctIndex: 0 },
    alamSatwa: { text: 'Bunga Rafflesia arnoldii, bunga terbesar di dunia, pertama kali ditemukan di provinsi?', options: ['Bengkulu', 'Sumatera Barat', 'Jambi', 'Aceh'], correctIndex: 0 },
  },
  {
    code: 'la',
    kuliner: { text: 'Sambal ikan khas dengan campuran tempoyak dan terasi dari provinsi Lampung disebut?', options: ['Seruit', 'Pindang', 'Gulai', 'Botok'], correctIndex: 0 },
    pariwisata: { text: 'Menara berbentuk siger (mahkota adat) jadi gerbang ikon provinsi?', options: ['Lampung', 'Bengkulu', 'Sumatera Selatan', 'Banten'], correctIndex: 0 },
    sejarahLegenda: { text: 'Letusan gunung api dahsyat tahun 1883 di Selat Sunda dekat Lampung adalah?', options: ['Krakatau', 'Merapi', 'Tambora', 'Sinabung'], correctIndex: 0 },
    budaya: { text: 'Kain tenun bermotif sulaman benang emas khas Lampung disebut kain?', options: ['Tapis', 'Songket', 'Ulos', 'Ikat'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional Way Kambas, pusat konservasi gajah Sumatera, berada di provinsi?', options: ['Lampung', 'Bengkulu', 'Jambi', 'Riau'], correctIndex: 0 },
  },
  {
    code: 'kr',
    kuliner: { text: 'Siput laut rebus yang jadi kuliner khas kepulauan Riau disebut?', options: ['Gonggong', 'Kerang', 'Cumi bakar', 'Udang galah'], correctIndex: 0 },
    pariwisata: { text: 'Jembatan yang menghubungkan gugusan pulau di kota Batam bernama?', options: ['Jembatan Barelang', 'Jembatan Ampera', 'Jembatan Suramadu', 'Jembatan Merah'], correctIndex: 0 },
    sejarahLegenda: { text: 'Pulau tempat lahirnya karya sastra Gurindam Dua Belas karya Raja Ali Haji adalah?', options: ['Pulau Penyengat', 'Pulau Bintan', 'Pulau Batam', 'Pulau Natuna'], correctIndex: 0 },
    budaya: { text: 'Gurindam Dua Belas adalah karya sastra klasik khas budaya?', options: ['Melayu', 'Batak', 'Minang', 'Bugis'], correctIndex: 0 },
    alamSatwa: { text: 'Provinsi kepulauan yang berbatasan langsung dengan Singapura dan Malaysia adalah?', options: ['Kepulauan Riau', 'Riau', 'Bangka Belitung', 'Kalimantan Utara'], correctIndex: 0 },
  },
  {
    code: 'bb',
    kuliner: { text: 'Mie kuah dengan topping udang dan ikan, khas Pulau Bangka Belitung, disebut?', options: ['Mie Bangka/Belitung', 'Mie Aceh', 'Mie Celor', 'Mie Koclok'], correctIndex: 0 },
    pariwisata: { text: 'Pantai berbatu granit raksasa yang populer lewat film Laskar Pelangi ada di provinsi?', options: ['Bangka Belitung', 'Kepulauan Riau', 'Lampung', 'Riau'], correctIndex: 0 },
    sejarahLegenda: { text: 'Bangka Belitung sejak dulu dikenal sebagai daerah penghasil tambang?', options: ['Timah', 'Emas', 'Batu bara', 'Nikel'], correctIndex: 0 },
    budaya: { text: 'Tarian penyambutan tamu tradisional khas Bangka Belitung disebut?', options: ['Tari Sepen', 'Tari Zapin', 'Tari Piring', 'Tari Saman'], correctIndex: 0 },
    alamSatwa: { text: 'Pulau kecil dengan mercusuar tua peninggalan Belanda yang jadi ikon wisata Belitung adalah?', options: ['Pulau Lengkuas', 'Pulau Weh', 'Pulau Samosir', 'Pulau Derawan'], correctIndex: 0 },
  },
  {
    code: 'jk',
    kuliner: { text: 'Makanan dari telur, ketan, dan ebi yang dipanggang, khas Betawi, disebut?', options: ['Kerak Telor', 'Gudeg', 'Rawon', 'Karedok'], correctIndex: 0 },
    pariwisata: { text: 'Monumen Nasional (Monas) yang jadi ikon Indonesia berada di kota?', options: ['Jakarta', 'Bandung', 'Bogor', 'Surabaya'], correctIndex: 0 },
    sejarahLegenda: { text: 'Nama Jakarta pada masa penjajahan Belanda adalah?', options: ['Batavia', 'Sunda Kelapa', 'Jayakarta', 'Weltevreden'], correctIndex: 0 },
    budaya: { text: 'Boneka raksasa yang diarak dalam perayaan budaya Betawi disebut?', options: ['Ondel-ondel', 'Reog', 'Barongsai', 'Wayang golek'], correctIndex: 0 },
    alamSatwa: { text: 'Gugusan pulau wisata di utara Jakarta yang jadi bagian wilayah provinsi DKI Jakarta adalah?', options: ['Kepulauan Seribu', 'Kepulauan Karimunjawa', 'Kepulauan Derawan', 'Kepulauan Riau'], correctIndex: 0 },
  },
  {
    code: 'jb',
    kuliner: { text: 'Lotek sayur mentah berbumbu kacang dan batagor adalah kuliner khas suku?', options: ['Sunda', 'Jawa', 'Betawi', 'Madura'], correctIndex: 0 },
    pariwisata: { text: 'Kawah berwarna putih kehijauan yang jadi objek wisata di Bandung adalah?', options: ['Kawah Putih', 'Kawah Ijen', 'Kelimutu', 'Kawah Sikidang'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan Hindu tertua di Nusantara, Tarumanagara, berpusat di provinsi?', options: ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten'], correctIndex: 0 },
    budaya: { text: 'Alat musik bambu yang dimainkan dengan cara digoyangkan, khas Sunda, disebut?', options: ['Angklung', 'Gamelan', 'Sasando', 'Kolintang'], correctIndex: 0 },
    alamSatwa: { text: 'Gunung dengan legenda Sangkuriang yang bentuknya menyerupai perahu terbalik berada di provinsi?', options: ['Jawa Barat', 'Jawa Tengah', 'Banten', 'DI Yogyakarta'], correctIndex: 0 },
  },
  {
    code: 'jt',
    kuliner: { text: 'Camilan gulung berisi rebung dan udang yang jadi oleh-oleh khas Semarang disebut?', options: ['Lumpia', 'Batagor', 'Risoles', 'Pastel'], correctIndex: 0 },
    pariwisata: { text: 'Candi Buddha terbesar di dunia, Borobudur, berada di provinsi?', options: ['Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Jawa Barat'], correctIndex: 0 },
    sejarahLegenda: { text: 'Candi Borobudur dibangun pada masa kejayaan wangsa/kerajaan?', options: ['Syailendra (Mataram Kuno)', 'Majapahit', 'Sriwijaya', 'Demak'], correctIndex: 0 },
    budaya: { text: 'Motif batik klasik keraton yang berasal dari kota Solo disebut batik?', options: ['Sido Mukti', 'Mega Mendung', 'Parang Barong Pekalongan', 'Simbut'], correctIndex: 0 },
    alamSatwa: { text: 'Gunung tertinggi kedua di Pulau Jawa, Gunung Slamet, berada di provinsi?', options: ['Jawa Tengah', 'Jawa Timur', 'Jawa Barat', 'DI Yogyakarta'], correctIndex: 0 },
  },
  {
    code: 'yo',
    kuliner: { text: 'Olahan nangka muda bersantan manis yang jadi ikon kuliner Yogyakarta disebut?', options: ['Gudeg', 'Rawon', 'Rendang', 'Soto Betawi'], correctIndex: 0 },
    pariwisata: { text: 'Istana kesultanan yang masih berfungsi dan jadi objek wisata budaya di kota Yogyakarta adalah?', options: ['Keraton Yogyakarta', 'Keraton Surakarta', 'Keraton Kasepuhan', 'Keraton Kanoman'], correctIndex: 0 },
    sejarahLegenda: { text: 'Yogyakarta memiliki status istimewa karena dipimpin turun-temurun oleh seorang?', options: ['Sultan', 'Gubernur terpilih biasa', 'Wali kota', 'Bupati'], correctIndex: 0 },
    budaya: { text: 'Tarian sakral yang hanya dipentaskan di lingkungan keraton Yogyakarta/Surakarta disebut?', options: ['Bedhaya Ketawang', 'Kecak', 'Piring', 'Saman'], correctIndex: 0 },
    alamSatwa: { text: 'Pantai dengan legenda Nyi Roro Kidul yang terkenal di selatan Yogyakarta adalah?', options: ['Parangtritis', 'Kuta', 'Sanur', 'Anyer'], correctIndex: 0 },
  },
  {
    code: 'jw',
    kuliner: { text: 'Sup daging berkuah hitam dari kluwek yang jadi kuliner khas provinsi Jawa Timur disebut?', options: ['Rawon', 'Rendang', 'Gudeg', 'Karedok'], correctIndex: 0 },
    pariwisata: { text: 'Gunung dengan lautan pasir dan matahari terbit ikonik yang jadi favorit wisatawan adalah?', options: ['Gunung Bromo', 'Gunung Merapi', 'Gunung Rinjani', 'Gunung Agung'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan Hindu terbesar dalam sejarah Nusantara, Majapahit, berpusat di provinsi?', options: ['Jawa Timur', 'Jawa Tengah', 'Jawa Barat', 'Bali'], correctIndex: 0 },
    budaya: { text: 'Kesenian tradisional dengan topeng singa berbulu yang berasal dari Ponorogo disebut?', options: ['Reog', 'Ondel-ondel', 'Barongsai', 'Wayang kulit'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional dengan sabana luas yang dijuluki "Little Africa van Java" berada di provinsi?', options: ['Jawa Timur', 'Jawa Tengah', 'Jawa Barat', 'Bali'], correctIndex: 0 },
  },
  {
    code: 'bn',
    kuliner: { text: 'Sate ikan bandeng tanpa duri yang jadi kuliner khas provinsi Banten disebut?', options: ['Sate Bandeng', 'Sate Padang', 'Sate Klathak', 'Sate Maranggi'], correctIndex: 0 },
    pariwisata: { text: 'Taman Nasional habitat badak bercula satu yang berada di ujung barat Pulau Jawa adalah?', options: ['Ujung Kulon', 'Baluran', 'Gunung Leuser', 'Way Kambas'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kesultanan Banten pernah jadi pusat perdagangan lada terbesar berkat pelabuhan?', options: ['Banten Lama', 'Sunda Kelapa', 'Cirebon', 'Merak'], correctIndex: 0 },
    budaya: { text: 'Seni bela diri dengan atraksi kekebalan tubuh khas Banten disebut?', options: ['Debus', 'Pencak Silat Minang', 'Merpati Putih', 'Tarung Derajat'], correctIndex: 0 },
    alamSatwa: { text: 'Badak Jawa bercula satu yang hampir punah, habitatnya ada di taman nasional provinsi?', options: ['Banten', 'Jawa Timur', 'Jawa Tengah', 'Lampung'], correctIndex: 0 },
  },
  {
    code: 'ba',
    kuliner: { text: 'Ayam utuh berbumbu rempah yang dipanggang lama, kuliner khas Bali, disebut?', options: ['Ayam Betutu', 'Ayam Taliwang', 'Ayam Rica-rica', 'Ayam Woku'], correctIndex: 0 },
    pariwisata: { text: 'Pura yang berdiri di atas batu karang tepi laut dan populer buat foto sunset adalah?', options: ['Tanah Lot', 'Uluwatu', 'Besakih', 'Ulun Danu'], correctIndex: 0 },
    sejarahLegenda: { text: 'Perlawanan habis-habisan rakyat Bali melawan kolonial Belanda hingga gugur semua disebut?', options: ['Puputan', 'Perang Padri', 'Perang Diponegoro', 'Perang Aceh'], correctIndex: 0 },
    budaya: { text: 'Upacara pembakaran jenazah dalam tradisi Hindu Bali disebut?', options: ['Ngaben', 'Nyepi', 'Melasti', 'Galungan'], correctIndex: 0 },
    alamSatwa: { text: 'Kera ekor panjang yang jadi daya tarik wisata biasa ditemukan di hutan sekitar Pura?', options: ['Uluwatu/Sangeh', 'Prambanan', 'Borobudur', 'Besakih semata'], correctIndex: 0 },
  },
  {
    code: 'nb',
    kuliner: { text: 'Ayam bakar pedas khas Lombok yang terkenal seantero negeri disebut?', options: ['Ayam Taliwang', 'Ayam Betutu', 'Ayam Woku', 'Ayam Rica-rica'], correctIndex: 0 },
    pariwisata: { text: 'Gunung berapi dengan danau kawah Segara Anak yang populer buat pendakian adalah?', options: ['Gunung Rinjani', 'Gunung Bromo', 'Gunung Agung', 'Gunung Merapi'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan Islam bersejarah di Pulau Lombok bernama Kerajaan?', options: ['Selaparang', 'Gowa', 'Ternate', 'Buton'], correctIndex: 0 },
    budaya: { text: 'Tradisi menangkap cacing laut sebagai perayaan tahunan suku Sasak disebut?', options: ['Bau Nyale', 'Ngaben', 'Kasada', 'Sekaten'], correctIndex: 0 },
    alamSatwa: { text: 'Kepulauan kecil favorit snorkeling di lepas pantai Lombok bernama Kepulauan?', options: ['Gili', 'Derawan', 'Karimunjawa', 'Seribu'], correctIndex: 0 },
  },
  {
    code: 'nt',
    kuliner: { text: 'Daging asap khas Nusa Tenggara Timur yang punya cita rasa gurih disebut?', options: ['Se\'i', 'Rendang', 'Dendeng Balado', 'Abon'], correctIndex: 0 },
    pariwisata: { text: 'Danau kawah tiga warna yang bisa berubah-ubah warna, Danau Kelimutu, ada di pulau?', options: ['Flores', 'Timor', 'Sumba', 'Lombok'], correctIndex: 0 },
    sejarahLegenda: { text: 'Pulau tempat asal kadal purba raksasa Komodo termasuk wilayah provinsi?', options: ['Nusa Tenggara Timur', 'Nusa Tenggara Barat', 'Bali', 'Sulawesi Selatan'], correctIndex: 0 },
    budaya: { text: 'Kain tenun ikat dengan motif rumit khas Pulau Sumba adalah kerajinan tradisional provinsi?', options: ['Nusa Tenggara Timur', 'Nusa Tenggara Barat', 'Bali', 'Maluku'], correctIndex: 0 },
    alamSatwa: { text: 'Komodo, kadal terbesar di dunia, adalah satwa endemik provinsi?', options: ['Nusa Tenggara Timur', 'Nusa Tenggara Barat', 'Papua', 'Sulawesi'], correctIndex: 0 },
  },
  {
    code: 'kb',
    kuliner: { text: 'Bubur gurih berisi banyak sayur dan rempah khas Sambas jadi kuliner andalan provinsi?', options: ['Kalimantan Barat', 'Kalimantan Timur', 'Kalimantan Selatan', 'Kalimantan Tengah'], correctIndex: 0 },
    pariwisata: { text: 'Tugu penanda garis khatulistiwa (equator) yang jadi ikon wisata berada di kota?', options: ['Pontianak', 'Banjarmasin', 'Samarinda', 'Palangkaraya'], correctIndex: 0 },
    sejarahLegenda: { text: 'Istana kesultanan bersejarah Keraton Kadriyah berada di kota?', options: ['Pontianak', 'Banjarmasin', 'Samarinda', 'Palangkaraya'], correctIndex: 0 },
    budaya: { text: 'Rumah adat memanjang yang dihuni banyak keluarga sekaligus khas suku Dayak disebut?', options: ['Rumah Betang', 'Rumah Bolon', 'Rumah Joglo', 'Rumah Gadang'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional Gunung Palung, habitat orangutan Kalimantan, berada di provinsi?', options: ['Kalimantan Barat', 'Kalimantan Timur', 'Kalimantan Selatan', 'Kalimantan Utara'], correctIndex: 0 },
  },
  {
    code: 'kt',
    kuliner: { text: 'Olahan umbut rotan muda yang jadi sayur khas suku Dayak di provinsi ini disebut?', options: ['Juhu Singkah', 'Gulai Umbut', 'Sayur Asam', 'Lodeh'], correctIndex: 0 },
    pariwisata: { text: 'Taman Nasional Tanjung Puting, tujuan wisata melihat orangutan liar, berada di provinsi?', options: ['Kalimantan Tengah', 'Kalimantan Barat', 'Kalimantan Selatan', 'Kalimantan Timur'], correctIndex: 0 },
    sejarahLegenda: { text: 'Palangkaraya pernah direncanakan Presiden Soekarno sebagai calon ibu kota negara pada era?', options: ['Orde Lama', 'Orde Baru', 'Reformasi', 'Kolonial'], correctIndex: 0 },
    budaya: { text: 'Upacara adat kematian yang rumit dan sakral khas suku Dayak Ngaju disebut?', options: ['Tiwah', 'Ngaben', 'Rambu Solo', 'Kasada'], correctIndex: 0 },
    alamSatwa: { text: 'Sungai besar yang bermuara di kota Palangkaraya, ibu kota Kalimantan Tengah, adalah Sungai?', options: ['Kahayan', 'Musi', 'Kapuas', 'Mahakam'], correctIndex: 0 },
  },
  {
    code: 'ks',
    kuliner: { text: 'Soto berkuah kuning dengan ketupat khas Banjarmasin dikenal sebagai?', options: ['Soto Banjar', 'Soto Betawi', 'Soto Lamongan', 'Coto Makassar'], correctIndex: 0 },
    pariwisata: { text: 'Pasar di atas perahu yang jadi daya tarik wisata pagi hari khas Kalimantan Selatan disebut?', options: ['Pasar Terapung Lok Baintan', 'Pasar Klewer', 'Pasar Beringharjo', 'Pasar Kaget'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kesultanan Islam bersejarah yang berpusat di Kalimantan Selatan bernama Kesultanan?', options: ['Banjar', 'Kutai', 'Pontianak', 'Sambas'], correctIndex: 0 },
    budaya: { text: 'Kain dengan teknik ikat celup dan motif khas Banjar disebut kain?', options: ['Sasirangan', 'Tapis', 'Songket', 'Ulos'], correctIndex: 0 },
    alamSatwa: { text: 'Pegunungan dengan jalur trekking dan hutan tropis lebat yang membentang di provinsi ini disebut?', options: ['Pegunungan Meratus', 'Pegunungan Bukit Barisan', 'Pegunungan Jayawijaya', 'Pegunungan Muller'], correctIndex: 0 },
  },
  {
    code: 'ki',
    kuliner: { text: 'Nasi yang dimasak dengan cara dikepal dan disajikan dengan ikan asin, khas provinsi ini, disebut?', options: ['Nasi Bekepor', 'Nasi Kuning', 'Nasi Liwet', 'Nasi Jaha'], correctIndex: 0 },
    pariwisata: { text: 'Calon ibu kota baru Indonesia, Ibu Kota Nusantara (IKN), sedang dibangun di provinsi?', options: ['Kalimantan Timur', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Barat'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kerajaan Hindu tertua di Indonesia, Kutai Kartanegara, berlokasi di provinsi?', options: ['Kalimantan Timur', 'Kalimantan Selatan', 'Kalimantan Barat', 'Kalimantan Tengah'], correctIndex: 0 },
    budaya: { text: 'Pesta adat kerajaan tahunan yang digelar suku Kutai di Tenggarong disebut?', options: ['Erau', 'Sekaten', 'Kasada', 'Tabuik'], correctIndex: 0 },
    alamSatwa: { text: 'Kepulauan dengan penyu dan biota laut kaya, favorit diving, bernama Kepulauan?', options: ['Derawan', 'Seribu', 'Karimunjawa', 'Gili'], correctIndex: 0 },
  },
  {
    code: 'ku',
    kuliner: { text: 'Kepiting bercangkang lunak yang jadi kuliner unggulan kota Tarakan disebut kepiting?', options: ['Soka', 'Rajungan', 'Bakau', 'Kenari'], correctIndex: 0 },
    pariwisata: { text: 'Wilayah perbatasan dengan beras adan yang jadi tujuan wisata unik di Kalimantan Utara adalah?', options: ['Krayan', 'Nunukan Kota', 'Tarakan Pantai', 'Malinau Hulu'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kalimantan Utara resmi menjadi provinsi baru hasil pemekaran Kalimantan Timur pada tahun?', options: ['2012', '2000', '2005', '2020'], correctIndex: 0 },
    budaya: { text: 'Suku dengan tradisi memanjangkan daun telinga yang berasal dari Kalimantan Utara adalah suku?', options: ['Dayak Lundayeh', 'Dayak Ngaju', 'Dayak Kenyah semata', 'Dayak Iban semata'], correctIndex: 0 },
    alamSatwa: { text: 'Kawasan Krayan di Kalimantan Utara didominasi oleh ekosistem?', options: ['Hutan hujan tropis perbatasan', 'Hutan mangrove', 'Sabana', 'Hutan musim'], correctIndex: 0 },
  },
  {
    code: 'sv',
    kuliner: { text: 'Bubur campur sayuran dengan rasa gurih khas Manado disebut?', options: ['Tinutuan', 'Bubur Sumsum', 'Bubur Manado semata tanpa nama khusus', 'Bubur Ayam'], correctIndex: 0 },
    pariwisata: { text: 'Taman laut dengan terumbu karang indah yang populer buat diving berada di provinsi?', options: ['Sulawesi Utara (Bunaken)', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Maluku'], correctIndex: 0 },
    sejarahLegenda: { text: 'Pahlawan nasional dan tokoh pendiri semboyan "Sitou Timou Tumou Tou" berasal dari Sulawesi Utara, yaitu?', options: ['Sam Ratulangi', 'Sultan Hasanuddin', 'Pattimura', 'Diponegoro'], correctIndex: 0 },
    budaya: { text: 'Tarian perang dengan gerakan lincah dan pedang khas suku Minahasa disebut?', options: ['Tari Kabasaran', 'Tari Toraja', 'Tari Gorontalo', 'Tari Bugis'], correctIndex: 0 },
    alamSatwa: { text: 'Primata terkecil di dunia, tarsius, adalah satwa endemik pulau?', options: ['Sulawesi', 'Kalimantan', 'Sumatera', 'Papua'], correctIndex: 0 },
  },
  {
    code: 'st',
    kuliner: { text: 'Sup kaki sapi dengan kuah asam yang jadi kuliner khas kota Palu disebut?', options: ['Kaledo', 'Coto', 'Rawon', 'Sop Konro'], correctIndex: 0 },
    pariwisata: { text: 'Salah satu danau terdalam di Indonesia, Danau Poso, berada di provinsi?', options: ['Sulawesi Tengah', 'Sulawesi Utara', 'Sulawesi Selatan', 'Sulawesi Tenggara'], correctIndex: 0 },
    sejarahLegenda: { text: 'Situs purbakala dengan patung-patung batu kuno, Lore Lindu, berada di provinsi?', options: ['Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Utara', 'Sulawesi Tenggara'], correctIndex: 0 },
    budaya: { text: 'Suku asli mayoritas yang mendiami wilayah Sulawesi Tengah adalah suku?', options: ['Kaili', 'Bugis', 'Toraja', 'Gorontalo'], correctIndex: 0 },
    alamSatwa: { text: 'Taman Nasional Lore Lindu, habitat anoa dan burung maleo, berada di provinsi?', options: ['Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Sulawesi Barat'], correctIndex: 0 },
  },
  {
    code: 'sl',
    kuliner: { text: 'Sup daging berbumbu rempah khas dengan sambal tauco, ikon kuliner kota Makassar, disebut?', options: ['Coto Makassar', 'Sop Konro semata', 'Pallubasa semata', 'Kaledo'], correctIndex: 0 },
    pariwisata: { text: 'Kawasan dengan kuburan tebing dan rumah adat Tongkonan yang terkenal berada di provinsi?', options: ['Sulawesi Selatan (Tana Toraja)', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Tenggara'], correctIndex: 0 },
    sejarahLegenda: { text: 'Sultan Hasanuddin, pahlawan yang gigih melawan VOC, berasal dari Kerajaan?', options: ['Gowa', 'Bone', 'Wajo', 'Luwu'], correctIndex: 0 },
    budaya: { text: 'Rumah adat beratap pelana melengkung khas suku Toraja disebut Rumah?', options: ['Tongkonan', 'Betang', 'Bolon', 'Gadang'], correctIndex: 0 },
    alamSatwa: { text: 'Kawasan konservasi yang dijuluki "Kerajaan Kupu-Kupu" karena banyaknya spesies kupu-kupu ada di provinsi?', options: ['Sulawesi Selatan (Bantimurung)', 'Sulawesi Tengah', 'Sulawesi Tenggara', 'Sulawesi Barat'], correctIndex: 0 },
  },
  {
    code: 'sr',
    kuliner: { text: 'Olahan sagu yang jadi makanan pokok tradisional suku-suku di Sulawesi Tenggara disebut?', options: ['Sinonggi', 'Papeda', 'Kapurung', 'Bagea'], correctIndex: 0 },
    pariwisata: { text: 'Taman Nasional dengan terumbu karang terbaik dunia, Wakatobi, berada di provinsi?', options: ['Sulawesi Tenggara', 'Sulawesi Selatan', 'Maluku', 'Papua Barat'], correctIndex: 0 },
    sejarahLegenda: { text: 'Benteng keraton terluas di dunia menurut catatan Guinness, Benteng Keraton Buton, berada di provinsi?', options: ['Sulawesi Tenggara', 'Sulawesi Selatan', 'Sulawesi Tengah', 'Maluku'], correctIndex: 0 },
    budaya: { text: 'Suku dengan tradisi maritim kuat dan benteng bersejarah di Sulawesi Tenggara adalah suku?', options: ['Buton/Wolio', 'Bugis semata', 'Makassar semata', 'Mandar semata'], correctIndex: 0 },
    alamSatwa: { text: 'Nama Wakatobi berasal dari singkatan empat pulau: Wangi-wangi, Kaledupa, Tomia, dan?', options: ['Binongko', 'Buton', 'Muna', 'Selayar'], correctIndex: 0 },
  },
  {
    code: 'go',
    kuliner: { text: 'Sup jagung dengan ikan cakalang, kuliner khas provinsi Gorontalo, disebut?', options: ['Binte Biluhuta', 'Tinutuan', 'Kaledo', 'Bubur Manado'], correctIndex: 0 },
    pariwisata: { text: 'Danau besar yang jadi ikon wisata dan sumber air penting provinsi Gorontalo adalah?', options: ['Danau Limboto', 'Danau Poso', 'Danau Toba', 'Danau Sentani'], correctIndex: 0 },
    sejarahLegenda: { text: 'Gorontalo dijuluki "Serambi Madinah" karena kentalnya suasana keagamaan?', options: ['Islam', 'Hindu', 'Buddha', 'Kristen'], correctIndex: 0 },
    budaya: { text: 'Upacara adat menyambut masa kehamilan tujuh bulan khas Gorontalo disebut?', options: ['Molonthalo', 'Tedak Siten', 'Mitoni Jawa', 'Ngaben'], correctIndex: 0 },
    alamSatwa: { text: 'Burung dengan telur berukuran raksasa dibanding tubuhnya, burung Maleo, banyak ditemukan di kawasan konservasi provinsi?', options: ['Gorontalo', 'Bali', 'Papua', 'Maluku'], correctIndex: 0 },
  },
  {
    code: 'sa',
    kuliner: { text: 'Roti pipih dari singkong khas suku Mandar yang jadi makanan pokok tradisional disebut?', options: ['Jepa', 'Sagu Lempeng', 'Kue Cucur', 'Onde-onde'], correctIndex: 0 },
    pariwisata: { text: 'Pantai yang jadi ikon wisata kota Mamuju, ibu kota provinsi Sulawesi Barat, bernama?', options: ['Pantai Manakarra', 'Pantai Losari', 'Pantai Bira', 'Pantai Malalayang'], correctIndex: 0 },
    sejarahLegenda: { text: 'Sulawesi Barat resmi menjadi provinsi hasil pemekaran dari Sulawesi Selatan pada tahun?', options: ['2004', '1999', '2010', '2000'], correctIndex: 0 },
    budaya: { text: 'Suku Mandar dikenal sebagai pelaut ulung yang membuat perahu layar cepat bernama?', options: ['Sandeq', 'Pinisi', 'Jukung', 'Lambo'], correctIndex: 0 },
    alamSatwa: { text: 'Perahu layar tradisional tercepat Nusantara, Sandeq, berasal dari budaya maritim suku?', options: ['Mandar', 'Bugis', 'Bajo', 'Makassar'], correctIndex: 0 },
  },
  {
    code: 'ma',
    kuliner: { text: 'Bubur sagu yang jadi makanan pokok tradisional Indonesia Timur disebut?', options: ['Papeda', 'Tinutuan', 'Kapurung', 'Sinonggi'], correctIndex: 0 },
    pariwisata: { text: 'Kepulauan pusat rempah pala dunia sejak abad ke-16, Kepulauan Banda, berada di provinsi?', options: ['Maluku', 'Maluku Utara', 'Papua Barat', 'Sulawesi Utara'], correctIndex: 0 },
    sejarahLegenda: { text: 'Pattimura, pahlawan nasional pemimpin perlawanan rakyat Maluku, melawan kekuasaan?', options: ['Belanda (Hindia Belanda)', 'Portugis', 'Inggris', 'Jepang'], correctIndex: 0 },
    budaya: { text: 'Tarian perang tradisional dengan properti parang dan salawaku (tameng) khas Maluku disebut?', options: ['Tari Cakalele', 'Tari Kabasaran', 'Tari Perang Papua', 'Tari Caci'], correctIndex: 0 },
    alamSatwa: { text: 'Kepulauan penghasil pala dengan terumbu karang indah, Kepulauan Banda, termasuk provinsi?', options: ['Maluku', 'Maluku Utara', 'Papua Barat', 'Sulawesi Tenggara'], correctIndex: 0 },
  },
  {
    code: 'mu',
    kuliner: { text: 'Nasi yang dibakar dalam batang bambu, kuliner khas Maluku Utara, disebut?', options: ['Nasi Jaha', 'Nasi Bakar Jawa', 'Nasi Liwet', 'Nasi Bekepor'], correctIndex: 0 },
    pariwisata: { text: 'Danau penuh mitos yang konon bisa mengabulkan permintaan, Danau Tolire, berada di kota?', options: ['Ternate', 'Ambon', 'Tidore', 'Sofifi'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kesultanan Ternate dan Tidore dulu terkenal sebagai pusat perdagangan rempah?', options: ['Cengkeh dan pala', 'Lada', 'Kopi', 'Timah'], correctIndex: 0 },
    budaya: { text: 'Kesultanan Islam tertua di kawasan timur Nusantara, Kesultanan Ternate, berada di provinsi?', options: ['Maluku Utara', 'Maluku', 'Papua Barat', 'Sulawesi Utara'], correctIndex: 0 },
    alamSatwa: { text: 'Gunung berapi aktif yang mendominasi lanskap Pulau Ternate bernama Gunung?', options: ['Gamalama', 'Merapi', 'Semeru', 'Rinjani'], correctIndex: 0 },
  },
  {
    code: 'pa',
    kuliner: { text: 'Papeda disajikan dengan kuah ikan berwarna kuning cerah adalah hidangan khas suku asli provinsi?', options: ['Papua', 'Maluku', 'Sulawesi Utara', 'Nusa Tenggara Timur'], correctIndex: 0 },
    pariwisata: { text: 'Danau besar dekat kota Jayapura yang jadi tujuan wisata dan lokasi festival budaya adalah?', options: ['Danau Sentani', 'Danau Toba', 'Danau Poso', 'Danau Limboto'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kota Jayapura, ibu kota provinsi Papua, dulu dikenal dengan nama kolonial?', options: ['Hollandia', 'Merauke', 'Sorong', 'Fakfak'], correctIndex: 0 },
    budaya: { text: 'Tas rajut tradisional Papua yang diakui UNESCO sebagai warisan budaya dunia disebut?', options: ['Noken', 'Koteka', 'Honai semata', 'Ukiran Asmat semata'], correctIndex: 0 },
    alamSatwa: { text: 'Burung ikon Papua dengan bulu warna-warni indah dijuluki burung?', options: ['Cenderawasih (bird of paradise)', 'Merak', 'Rangkong', 'Elang Jawa'], correctIndex: 0 },
  },
  {
    code: 'pb',
    kuliner: { text: 'Ikan bakar berbumbu rica pedas ala nelayan pesisir jadi kuliner khas provinsi?', options: ['Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Maluku Utara'], correctIndex: 0 },
    pariwisata: { text: 'Taman nasional laut terbesar di Indonesia, Teluk Cenderawasih, berada di provinsi?', options: ['Papua Barat', 'Papua', 'Papua Tengah', 'Papua Barat Daya'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kota Manokwari dikenal sebagai "Kota Injil" karena jadi titik awal misi Kristen di tanah Papua pada tahun?', options: ['1855', '1900', '1945', '1963'], correctIndex: 0 },
    budaya: { text: 'Suku Arfak yang mendiami pegunungan Papua Barat dikenal dengan tarian adat?', options: ['Tari Tumbu Tanah', 'Tari Saman', 'Tari Kecak', 'Tari Piring'], correctIndex: 0 },
    alamSatwa: { text: 'Burung Cenderawasih Merah, satwa endemik langka, habitat aslinya ada di kawasan?', options: ['Papua Barat (Waigeo dan sekitarnya)', 'Papua Selatan', 'Papua Tengah', 'Maluku'], correctIndex: 0 },
  },
  {
    code: 'pt',
    kuliner: { text: 'Ulat sagu jadi sumber protein tradisional yang dikonsumsi suku pedalaman provinsi?', options: ['Papua Tengah', 'Papua Barat', 'Papua Selatan', 'Maluku'], correctIndex: 0 },
    pariwisata: { text: 'Kabupaten Nabire, gerbang wisata Teluk Cenderawasih dari sisi selatan, berada di provinsi?', options: ['Papua Tengah', 'Papua', 'Papua Barat', 'Papua Pegunungan'], correctIndex: 0 },
    sejarahLegenda: { text: 'Papua Tengah resmi menjadi provinsi baru hasil pemekaran Papua pada tahun?', options: ['2022', '2010', '2000', '2015'], correctIndex: 0 },
    budaya: { text: 'Suku Mee dan Moni di dataran tinggi Papua Tengah dikenal dengan tradisi memasak komunal disebut?', options: ['Bakar batu', 'Rambu Solo', 'Ngaben', 'Kasada'], correctIndex: 0 },
    alamSatwa: { text: 'Tambang emas dan tembaga terbesar di dunia, Grasberg, berada di kawasan pegunungan provinsi?', options: ['Papua Tengah', 'Papua Pegunungan', 'Papua', 'Papua Barat'], correctIndex: 0 },
  },
  {
    code: 'pp',
    kuliner: { text: 'Cara memasak tradisional komunal menggunakan batu panas, khas masyarakat pegunungan Papua, disebut?', options: ['Bakar batu', 'Bakar sate', 'Panggang bambu', 'Kukus daun'], correctIndex: 0 },
    pariwisata: { text: 'Lembah yang jadi lokasi Festival Lembah Baliem tahunan berada di provinsi?', options: ['Papua Pegunungan', 'Papua Tengah', 'Papua', 'Papua Selatan'], correctIndex: 0 },
    sejarahLegenda: { text: 'Festival Lembah Baliem menampilkan simulasi perang antarsuku sebagai simbol?', options: ['Perdamaian dan kekuatan', 'Perayaan panen semata', 'Upacara kematian', 'Ritual pernikahan'], correctIndex: 0 },
    budaya: { text: 'Suku Dani yang mendiami Lembah Baliem tinggal di rumah tradisional bulat beratap jerami disebut?', options: ['Honai', 'Bolon', 'Gadang', 'Betang'], correctIndex: 0 },
    alamSatwa: { text: 'Puncak bersalju tertinggi di Indonesia, Puncak Jaya (Carstensz), berada di provinsi?', options: ['Papua Pegunungan', 'Papua Tengah', 'Papua', 'Papua Selatan'], correctIndex: 0 },
  },
  {
    code: 'ps',
    kuliner: { text: 'Sagu bakar dengan ikan kuah kuning adalah hidangan khas suku Marind di provinsi?', options: ['Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat'], correctIndex: 0 },
    pariwisata: { text: 'Taman Nasional dengan sabana luas mirip savana Afrika, dijuluki "Serengeti-nya Papua", berada di provinsi?', options: ['Papua Selatan (Wasur)', 'Papua', 'Papua Barat', 'Papua Tengah'], correctIndex: 0 },
    sejarahLegenda: { text: 'Kota paling timur Indonesia, Merauke, adalah ibu kota provinsi?', options: ['Papua Selatan', 'Papua', 'Papua Tengah', 'Papua Barat'], correctIndex: 0 },
    budaya: { text: 'Suku terkenal dengan seni ukir kayu bernilai tinggi yang mendiami wilayah Papua Selatan adalah suku?', options: ['Asmat', 'Dani', 'Arfak', 'Mee'], correctIndex: 0 },
    alamSatwa: { text: 'Rusa dan kanguru pohon jadi satwa khas savana di Taman Nasional Wasur, provinsi?', options: ['Papua Selatan', 'Papua', 'Papua Barat', 'Maluku'], correctIndex: 0 },
  },
  {
    code: 'pd',
    kuliner: { text: 'Aneka olahan hasil laut segar jadi andalan kuliner masyarakat kepulauan di provinsi?', options: ['Papua Barat Daya', 'Papua Barat', 'Papua Tengah', 'Maluku Utara'], correctIndex: 0 },
    pariwisata: { text: 'Surga wisata bawah laut dengan biodiversitas tertinggi di dunia, Raja Ampat, termasuk provinsi?', options: ['Papua Barat Daya', 'Papua Barat', 'Papua Tengah', 'Papua Selatan'], correctIndex: 0 },
    sejarahLegenda: { text: 'Papua Barat Daya resmi menjadi provinsi baru hasil pemekaran Papua Barat pada tahun?', options: ['2022', '2010', '2015', '2005'], correctIndex: 0 },
    budaya: { text: 'Kesultanan yang dulu punya pengaruh besar hingga wilayah kepulauan Raja Ampat adalah Kesultanan?', options: ['Tidore', 'Mataram', 'Demak', 'Banten'], correctIndex: 0 },
    alamSatwa: { text: 'Spot foto ikon dengan gugusan pulau karst hijau yang jadi wajah promosi wisata Indonesia bernama?', options: ['Piaynemo', 'Kelimutu', 'Bunaken', 'Wakatobi'], correctIndex: 0 },
  },
];

const NOW = Date.now();

async function deleteOldTopicData() {
  console.log('Menghapus data topik lama...');
  for (const mapId of OLD_MAP_IDS) {
    await db.collection('maps').doc(mapId).delete().catch(() => {});

    const regionsSnap = await db.collection('regions').where('mapId', '==', mapId).get();
    for (const doc of regionsSnap.docs) await doc.ref.delete();

    const questionsSnap = await db.collection('questions').where('mapId', '==', mapId).get();
    for (const doc of questionsSnap.docs) await doc.ref.delete();

    console.log(`  ✓ dihapus: map "${mapId}" (${regionsSnap.size} region, ${questionsSnap.size} soal)`);
  }
}

async function seedMaps() {
  console.log('Seeding maps...');
  for (const m of MAPS) {
    const id = mapIdFor(m.name);
    await db.collection('maps').doc(id).set({
      mapId: id,
      ...m,
      isActive: true,
      createdAt: NOW,
    });
    console.log(`  ✓ map: ${id}`);
  }
}

function mapIdFor(name: string): string {
  return name.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');
}

async function seedRegions() {
  console.log('Seeding regions (38 provinsi x 5 topik)...');
  for (const m of MAPS) {
    const mapId = mapIdFor(m.name);
    for (const p of PROVINCES) {
      const id = `${mapId}_${p.code}`;
      await db.collection('regions').doc(id).set({
        regionId: id,
        name: p.name,
        code: p.code,
        mapId,
        description: `${m.name} — ${p.name}`,
        isActive: true,
        createdAt: NOW,
      });
    }
    console.log(`  ✓ ${PROVINCES.length} region buat map "${mapId}"`);
  }
}

async function seedQuestions() {
  console.log('Seeding soal (1 per topik per provinsi)...');
  const topicKeyToMapName: Record<keyof Omit<ProvinceQuestions, 'code'>, string> = {
    kuliner: 'Kuliner',
    pariwisata: 'Pariwisata',
    sejarahLegenda: 'Sejarah & Legenda',
    budaya: 'Budaya',
    alamSatwa: 'Alam & Satwa',
  };

  let count = 0;
  for (const pq of PROVINCE_QUESTIONS) {
    for (const key of Object.keys(topicKeyToMapName) as (keyof typeof topicKeyToMapName)[]) {
      const mapId = mapIdFor(topicKeyToMapName[key]);
      const qa = pq[key];
      await db.collection('questions').add({
        text: qa.text,
        options: qa.options,
        correctIndex: qa.correctIndex,
        mapId,
        regionId: `${mapId}_${pq.code}`,
        difficulty: 'easy',
        isActive: true,
        isApproved: true,
        generatedBy: 'manual',
        createdAt: NOW,
      });
      count++;
    }
  }
  console.log(`  ✓ ${count} soal ditambahkan`);
}

async function seedDestinations() {
  const existing = await db.collection('destinations').limit(1).get();
  if (!existing.empty) {
    console.log('Skipping destinations — collection already has data.');
    return;
  }
  console.log('Seeding destinations...');
  const list = [
    { nama: 'Kota Bandung', provinsi: 'Jawa Barat', type: 'kota', deskripsi: 'Ibu kota Provinsi Jawa Barat, dikenal sebagai Paris van Java' },
    { nama: 'Kota Yogyakarta', provinsi: 'DI Yogyakarta', type: 'kota', deskripsi: 'Kota pelajar dan pusat kebudayaan Jawa' },
    { nama: 'Candi Borobudur', provinsi: 'Jawa Tengah', type: 'wisata', deskripsi: 'Candi Buddha terbesar di dunia' },
    { nama: 'Danau Toba', provinsi: 'Sumatera Utara', type: 'wisata', deskripsi: 'Danau vulkanik terbesar di Asia Tenggara' },
    { nama: 'Raja Ampat', provinsi: 'Papua Barat Daya', type: 'wisata', deskripsi: 'Kepulauan dengan keindahan bawah laut terbaik di dunia' },
  ];
  for (const d of list) {
    await db.collection('destinations').add({
      ...d,
      createdAt: NOW,
      updatedAt: NOW,
    });
    console.log(`  ✓ destination: ${d.nama}`);
  }
}

async function seedInformationItems() {
  const existing = await db.collection('informationItems').limit(1).get();
  if (!existing.empty) {
    console.log('Skipping information items — collection already has data.');
    return;
  }
  console.log('Seeding information items...');
  const items = [
    { tab: 'Kuliner', sectionTitle: 'Makanan Khas', title: 'Rendang', description: 'Masakan daging khas Minangkabau yang dimasak dengan santan dan rempah.', order: 1 },
    { tab: 'Pariwisata', sectionTitle: 'Wisata Alam', title: 'Gunung Bromo', description: 'Gunung berapi aktif di Jawa Timur dengan pemandangan matahari terbit yang terkenal.', order: 1 },
    { tab: 'Sejarah & Legenda', sectionTitle: 'Kerajaan', title: 'Majapahit', description: 'Kerajaan Hindu terbesar dalam sejarah Nusantara, berpusat di Jawa Timur.', order: 1 },
    { tab: 'Budaya', sectionTitle: 'Tarian', title: 'Tari Saman', description: 'Tarian tradisional Aceh yang dimainkan sambil duduk berbaris.', order: 1 },
    { tab: 'Alam & Satwa', sectionTitle: 'Satwa Endemik', title: 'Komodo', description: 'Kadal terbesar di dunia, satwa endemik Nusa Tenggara Timur.', order: 1 },
  ];
  for (const item of items) {
    await db.collection('informationItems').add({
      ...item,
      createdAt: NOW,
      updatedAt: NOW,
    });
    console.log(`  ✓ information: ${item.title}`);
  }
}

async function main() {
  console.log(`Seeding Firestore for project: ${PROJECT_ID}\n`);
  await deleteOldTopicData();
  await seedMaps();
  await seedRegions();
  await seedQuestions();
  await seedDestinations();
  await seedInformationItems();
  console.log('\n✅ Seed complete!');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
