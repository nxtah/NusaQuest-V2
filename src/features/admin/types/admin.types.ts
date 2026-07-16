export interface AdminQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdBy?: string;
  createdAt?: string;
}

export interface AdminTopic {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
}

export interface AdminGame {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rules?: string[];
  createdAt?: string;
}

export interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'user';
  createdAt?: string;
  lastLogin?: string;
}
