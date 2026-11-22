import { docToText } from "@/utils/richDoc";
import type { Task } from "@/types/task";

export type TaskErrors = Partial<Record<"title" | "description", string>>;

export function validateTask({ title, description }: Pick<Task, "title" | "description">): TaskErrors {
  const errors: TaskErrors = {};
  if (!title.trim()) errors.title = "El título es obligatorio";
  if (!docToText(description)) errors.description = "La descripción es obligatoria";
  return errors;
}
