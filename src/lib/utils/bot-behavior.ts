/**
 * Peluang bot jawab BENAR — bukan asal tebak rata (1/N opsi), biar kerasa
 * "kayak manusia" (kadang bener, kadang salah) daripada keliatan jelas dumb-
 * random atau sebaliknya gak pernah salah. Dipakai bareng Ular Tangga &
 * NusaCard biar tingkat kesulitan bot konsisten di kedua game.
 */
const BOT_CORRECT_ANSWER_CHANCE = 0.7;

/**
 * Pilih index jawaban buat bot — condong ke jawaban benar (peluang di atas),
 * sisanya nyebar rata ke opsi salah lainnya. Fallback ke tebakan rata kalau
 * index jawaban benar gak diketahui (mis. soal belum sempat kemuat).
 */
export function pickBotAnswerIndex(
  correctIndex: number | null | undefined,
  optionsCount: number,
  correctChance: number = BOT_CORRECT_ANSWER_CHANCE,
): number {
  const safeCount = Math.max(optionsCount, 1);
  if (correctIndex == null || correctIndex < 0 || correctIndex >= safeCount) {
    return Math.floor(Math.random() * safeCount);
  }
  if (Math.random() < correctChance) return correctIndex;

  const wrongIndices = Array.from({ length: safeCount }, (_, i) => i).filter((i) => i !== correctIndex);
  if (wrongIndices.length === 0) return correctIndex;
  return wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
}
