import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/src/lib/utils/auth-api';

export const runtime = 'nodejs';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Model gratis di OpenRouter — DICOBA BERURUTAN (bukan 1 model tetap),
// karena kebukti langsung pas ngetes: ketersediaan model gratis di
// OpenRouter gak konsisten sama sekali. Sebagian besar model ":free"
// balikin 404 "No endpoints available matching your guardrail restrictions
// and data policy" tergantung setting privasi akun (openrouter.ai/settings
// /privacy) DAN provider di baliknya masing-masing — bukan cuma 1 saklar
// on/off, providernya beda-beda kena filter beda-beda. Yang PERTAMA
// berhasil (lolos guardrail + gak lagi rate-limited) yang dipakai.
const AI_MODEL_CANDIDATES = [
  'inclusionai/ling-3.0-flash-fin:free',
  'z-ai/glm-5.2:free',
  'minimax/minimax-m3:free',
  'google/gemma-4-31b-it:free',
];

const requestSchema = z.object({
  mapId: z.string().min(1),
  regionId: z.string().min(1),
  regionName: z.string().min(1),
  mapCategory: z.string().min(1),
  prompt: z.string().trim().min(1).max(1000),
  count: z.number().int().min(1).max(10),
});

const generatedQuestionSchema = z.object({
  text: z.string().min(1),
  options: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  correctIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});
const generatedQuestionsSchema = z.array(generatedQuestionSchema).min(1);

/**
 * Generate pertanyaan pakai AI (OpenRouter) — server-side ONLY. Versi lama
 * (`generateQuestionsWithAI` di `questions.service.ts`) jalan di CLIENT dan
 * baca `process.env.OPENROUTER_API_KEY` — env var tanpa prefix `NEXT_PUBLIC_`
 * SELALU `undefined` di browser, jadi fungsi itu gak pernah beneran bisa
 * jalan sama sekali. Route ini gantiin itu: API key cuma pernah ke-baca di
 * server, gak pernah nyampe ke browser sama sekali.
 *
 * SENGAJA gak nulis ke Firestore di sini — cuma balikin hasil generate-nya
 * ke client buat di-review/edit dulu sebelum admin klik Simpan (dikonfirmasi
 * user: generate -> preview yang bisa diedit -> baru commit).
 */
export const POST = withAuth(async (request: NextRequest) => {
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(await request.json());
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues.map((i) => i.message).join(', ') : 'Invalid request body';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'OpenRouter belum dikonfigurasi di server.' }, { status: 500 });
  }

  const systemPrompt = `Kamu adalah pembuat soal trivia edukasi budaya & geografi Indonesia untuk game anak-anak/remaja.
Buat ${body.count} soal pilihan ganda tentang "${body.mapCategory}" di daerah "${body.regionName}", Indonesia, sesuai instruksi tambahan berikut dari admin: "${body.prompt}".

Balas HANYA dengan JSON array, TANPA teks lain, format PERSIS seperti ini:
[
  { "text": "Pertanyaan?", "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"], "correctIndex": 0 }
]

Aturan:
- Tepat 4 pilihan per soal.
- correctIndex adalah index (0-3) dari jawaban yang benar.
- Soal harus akurat, edukatif, dan sesuai untuk semua umur.
- Bahasa Indonesia.`;

  let content: string | null = null;
  let lastErrorDetail = '';
  for (const model of AI_MODEL_CANDIDATES) {
    try {
      const aiRes = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: systemPrompt }],
          temperature: 0.7,
        }),
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error('OpenRouter API error:', model, aiRes.status, errText);
        lastErrorDetail = `${model}: ${aiRes.status}`;
        continue; // coba model kandidat berikutnya
      }

      const data = await aiRes.json();
      const candidateContent = data.choices?.[0]?.message?.content;
      if (candidateContent) {
        content = candidateContent;
        break;
      }
      lastErrorDetail = `${model}: respons kosong`;
    } catch (error) {
      console.error('Error calling OpenRouter:', model, error);
      lastErrorDetail = `${model}: ${error instanceof Error ? error.message : 'unknown error'}`;
    }
  }

  if (!content) {
    console.error('All OpenRouter model candidates failed:', lastErrorDetail);
    return NextResponse.json({ ok: false, error: 'Semua model AI gratis lagi gak tersedia. Coba lagi sebentar lagi.' }, { status: 502 });
  }

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return NextResponse.json({ ok: false, error: 'AI tidak mengembalikan format soal yang valid.' }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ ok: false, error: 'Gagal membaca hasil AI (bukan JSON valid).' }, { status: 502 });
  }

  const result = generatedQuestionsSchema.safeParse(parsed);
  if (!result.success) {
    return NextResponse.json({ ok: false, error: 'Hasil AI tidak sesuai format soal yang diharapkan.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true, questions: result.data });
}, { requireAdmin: true });
