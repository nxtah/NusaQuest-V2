export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type Question = {
	id: string;
	topicId: string;
	gameId: string;
	question: string;
	options: string[];
	answer: string;
	difficulty?: QuestionDifficulty;
	createdAt?: number;
	updatedAt?: number;
};
