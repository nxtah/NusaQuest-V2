export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface Destination {
  id: string;
  name: string;
  description?: string;
  image?: string;
  topic: string;
  type?: string;
  content?: string;
  details?: Record<string, unknown>;
}
