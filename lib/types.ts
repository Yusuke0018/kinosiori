export interface Task {
  id: string;
  text: string;
  date: string | null;
  priority: 'none' | 'low' | 'medium' | 'high';
  done: boolean;
  done_at: string | null;
  created_at: string;
  updated_at: string;
  sort_order: number;
}
