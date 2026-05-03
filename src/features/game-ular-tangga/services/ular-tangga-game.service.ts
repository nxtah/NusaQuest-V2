export interface UlarTanggaQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export async function getUlarTanggaQuestions(): Promise<UlarTanggaQuestion[]> {
  return [];
}