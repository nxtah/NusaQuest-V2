export type QuestionPayload = {
	id?: string;
	topicId: string;
	gameId: string;
	question: string;
	options: string[];
	answer: string;
	difficulty?: 'easy' | 'medium' | 'hard';
};

const ALLOWED_DIFFICULTY = new Set(['easy', 'medium', 'hard']);

export function parseQuestionPayload(payload: unknown): QuestionPayload {
	if (!payload || typeof payload !== 'object') {
		throw new Error('Invalid question payload: expected object');
	}

	const candidate = payload as Record<string, unknown>;
	const topicId = String(candidate.topicId ?? '');
	const gameId = String(candidate.gameId ?? '');
	const question = String(candidate.question ?? '');
	const optionsRaw = candidate.options;
	const answer = String(candidate.answer ?? '');
	const difficultyRaw = candidate.difficulty;

	if (!topicId || !gameId || !question || !answer) {
		throw new Error('Invalid question payload: required fields are missing');
	}

	if (!Array.isArray(optionsRaw) || optionsRaw.length < 2) {
		throw new Error('Invalid question payload: options must contain at least 2 items');
	}

	const options = optionsRaw.map((option) => String(option));
	if (!options.includes(answer)) {
		throw new Error('Invalid question payload: answer must be one of options');
	}

	let difficulty: QuestionPayload['difficulty'];
	if (difficultyRaw !== undefined && difficultyRaw !== null) {
		const normalized = String(difficultyRaw);
		if (!ALLOWED_DIFFICULTY.has(normalized)) {
			throw new Error('Invalid question payload: difficulty is invalid');
		}
		difficulty = normalized as QuestionPayload['difficulty'];
	}

	return {
		id: candidate.id ? String(candidate.id) : undefined,
		topicId,
		gameId,
		question,
		options,
		answer,
		difficulty,
	};
}
