export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}
