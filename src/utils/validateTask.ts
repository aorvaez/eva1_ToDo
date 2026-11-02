import type { Task } from "@/types/task";

export type TaskErrors = Partial<Record<"title" | "description", string>>;

export function validateTask({ title, description }: Pick<Task, "title" | "description">): TaskErrors {
  const errors: TaskErrors = {};
  if (!title.trim()) errors.title = "El título es obligatorio";
  if (!description.trim()) errors.description = "La descripción es obligatoria";
  return errors;
}
